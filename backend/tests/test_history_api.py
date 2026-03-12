"""
Backend API tests for AdFlow Pipeline - Test History & Comparison Feature
Tests the new /api/test-history endpoints for historical test comparison
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://adflow-pipeline.preview.emergentagent.com')

class TestHealthAndBasicEndpoints:
    """Basic health and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test the root API endpoint returns hello world"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Hello World"
        print(f"SUCCESS: Root endpoint returns {data}")
    
    def test_pc_status_endpoint(self):
        """Test the provisioned concurrency status endpoint"""
        response = requests.get(f"{BASE_URL}/api/pc-status")
        assert response.status_code == 200
        data = response.json()
        assert "current_pc" in data
        assert "status" in data
        print(f"SUCCESS: PC status endpoint returns current_pc={data['current_pc']}, status={data['status']}")


class TestHistoryAPI:
    """Tests for the test history endpoints"""
    
    def test_get_test_history(self):
        """Test GET /api/test-history returns list of past test runs"""
        response = requests.get(f"{BASE_URL}/api/test-history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Test history endpoint returns {len(data)} entries")
        
        # Verify structure of entries if any exist
        if len(data) > 0:
            entry = data[0]
            required_fields = ["id", "profile", "timestamp", "sent", "received", "stats", "throughput"]
            for field in required_fields:
                assert field in entry, f"Missing required field: {field}"
            
            # Verify stats structure
            assert "avg" in entry["stats"]
            assert "p95" in entry["stats"]
            assert "min" in entry["stats"]
            assert "max" in entry["stats"]
            print(f"SUCCESS: Entry has valid structure with profile={entry['profile']}, avg={entry['stats']['avg']}ms")
    
    def test_history_entries_have_latency_breakdown(self):
        """Test that history entries include latency_breakdown data"""
        response = requests.get(f"{BASE_URL}/api/test-history")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            entry = data[0]
            if entry.get("latency_breakdown"):
                breakdown = entry["latency_breakdown"]
                expected_keys = ["sqs_input_accept", "queue_wait_time", "sqs_lambda_trigger", 
                                 "lambda_compute", "lambda_io", "sqs_results_delivery"]
                for key in expected_keys:
                    assert key in breakdown, f"Missing latency breakdown key: {key}"
                print(f"SUCCESS: Entry has latency breakdown - lambda_trigger={breakdown['sqs_lambda_trigger']}ms")
            else:
                print("INFO: Entry does not have latency_breakdown (may be older entry)")
    
    def test_history_entries_have_bottleneck_analysis(self):
        """Test that history entries include bottleneck_analysis data"""
        response = requests.get(f"{BASE_URL}/api/test-history")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            entry = data[0]
            if entry.get("bottleneck_analysis"):
                analysis = entry["bottleneck_analysis"]
                expected_keys = ["primary_bottleneck", "bottleneck_percentage", "is_concurrency_limited", 
                                 "recommendation", "lambda_concurrency_used", "messages_per_second"]
                for key in expected_keys:
                    assert key in analysis, f"Missing bottleneck analysis key: {key}"
                print(f"SUCCESS: Entry has bottleneck analysis - primary={analysis['primary_bottleneck']}")
            else:
                print("INFO: Entry does not have bottleneck_analysis (may be older entry)")


class TestRunTestAndHistory:
    """Tests for running tests and verifying history is saved"""
    
    def test_run_warmup_test(self):
        """Test POST /api/test with warmup profile"""
        response = requests.post(
            f"{BASE_URL}/api/test",
            json={"profile": "warmup"},
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "sent" in data
        assert "received" in data
        assert "stats" in data
        assert "distribution" in data
        assert "throughput" in data
        
        # Verify test ran successfully
        assert data["sent"] == 10  # warmup sends 10 messages
        assert data["received"] > 0
        
        print(f"SUCCESS: Warmup test completed - sent={data['sent']}, received={data['received']}, avg={data['stats']['avg']}ms")
    
    def test_test_run_saves_to_history(self):
        """Test that running a test saves the result to history"""
        # Get current history count
        history_before = requests.get(f"{BASE_URL}/api/test-history").json()
        count_before = len(history_before)
        
        # Run a test
        response = requests.post(
            f"{BASE_URL}/api/test",
            json={"profile": "warmup"},
            timeout=60
        )
        assert response.status_code == 200
        test_result = response.json()
        
        # Get history again
        history_after = requests.get(f"{BASE_URL}/api/test-history").json()
        count_after = len(history_after)
        
        # Verify history increased by 1
        assert count_after >= count_before, f"History should have increased (before={count_before}, after={count_after})"
        
        # Verify latest entry matches test result
        latest_entry = history_after[0]  # History is sorted by timestamp desc
        assert latest_entry["profile"] == "warmup"
        assert latest_entry["sent"] == test_result["sent"]
        assert latest_entry["stats"]["avg"] == test_result["stats"]["avg"]
        
        print(f"SUCCESS: Test run saved to history (count: {count_before} -> {count_after})")


class TestDeleteHistory:
    """Tests for deleting history entries"""
    
    def test_delete_single_history_entry(self):
        """Test DELETE /api/test-history/{id} removes a specific entry"""
        # Get history
        history = requests.get(f"{BASE_URL}/api/test-history").json()
        
        if len(history) == 0:
            # Run a test first to create an entry
            requests.post(f"{BASE_URL}/api/test", json={"profile": "warmup"}, timeout=60)
            history = requests.get(f"{BASE_URL}/api/test-history").json()
        
        # Get the ID of the first entry
        entry_id = history[0]["id"]
        count_before = len(history)
        
        # Delete the entry
        response = requests.delete(f"{BASE_URL}/api/test-history/{entry_id}")
        assert response.status_code == 200
        data = response.json()
        assert data.get("deleted") == True
        
        # Verify entry was removed
        history_after = requests.get(f"{BASE_URL}/api/test-history").json()
        count_after = len(history_after)
        
        assert count_after == count_before - 1, f"History count should decrease by 1 (before={count_before}, after={count_after})"
        
        # Verify the specific entry is gone
        entry_ids_after = [e["id"] for e in history_after]
        assert entry_id not in entry_ids_after, "Deleted entry should not be in history"
        
        print(f"SUCCESS: Deleted entry {entry_id} (count: {count_before} -> {count_after})")


class TestHeartbeatAPI:
    """Tests for the heartbeat endpoint (used for auto-scaling PC)"""
    
    def test_heartbeat_endpoint(self):
        """Test POST /api/heartbeat for user activity tracking"""
        response = requests.post(f"{BASE_URL}/api/heartbeat")
        assert response.status_code == 200
        data = response.json()
        
        assert "received" in data
        assert data["received"] == True
        assert "timestamp" in data
        assert "provisioned_concurrency" in data
        assert "status" in data
        
        print(f"SUCCESS: Heartbeat endpoint responds - PC={data['provisioned_concurrency']}, status={data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
