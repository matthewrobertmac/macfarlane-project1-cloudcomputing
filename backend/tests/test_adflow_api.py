"""
AdFlow Pipeline API Tests
Tests for the complete redesigned portfolio site with:
- Ukrainian color theme design
- 8 tabs navigation
- Live Testing with AWS integration
- Test history with annotations
- Like-test comparison
"""
import pytest
import requests
import os
import json

# Use public URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://adflow-pipeline.preview.emergentagent.com')

class TestBasicEndpoints:
    """Basic API health and status checks"""
    
    def test_root_endpoint(self):
        """Test root API endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"Root endpoint response: {data}")
    
    def test_pc_status_endpoint(self):
        """Test provisioned concurrency status endpoint"""
        response = requests.get(f"{BASE_URL}/api/pc-status")
        assert response.status_code == 200
        data = response.json()
        assert "current_pc" in data
        assert "status" in data
        print(f"PC Status: current_pc={data['current_pc']}, status={data['status']}")


class TestHeartbeatEndpoint:
    """Heartbeat endpoint tests for auto-scaling PC"""
    
    def test_heartbeat_post(self):
        """Test heartbeat POST endpoint"""
        response = requests.post(f"{BASE_URL}/api/heartbeat")
        assert response.status_code == 200
        data = response.json()
        assert "received" in data
        assert data["received"] == True
        assert "timestamp" in data
        assert "provisioned_concurrency" in data
        assert "status" in data
        print(f"Heartbeat response: status={data['status']}, PC={data['provisioned_concurrency']}")


class TestTestHistoryEndpoints:
    """Test history CRUD and annotation tests"""
    
    def test_get_test_history(self):
        """Test GET /api/test-history returns list of past test runs"""
        response = requests.get(f"{BASE_URL}/api/test-history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Test history entries: {len(data)}")
        
        if len(data) > 0:
            entry = data[0]
            # Verify expected fields exist
            assert "id" in entry
            assert "profile" in entry
            assert "timestamp" in entry
            assert "stats" in entry
            assert "throughput" in entry
            print(f"First entry: profile={entry['profile']}, stats={entry['stats']}")
    
    def test_annotate_history_entry(self):
        """Test PATCH /api/test-history/{id}/annotate"""
        # First get an entry ID
        response = requests.get(f"{BASE_URL}/api/test-history")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) == 0:
            pytest.skip("No test history entries to annotate")
        
        entry_id = data[0]["id"]
        test_annotation = "Pytest annotation test"
        
        # Annotate the entry
        patch_response = requests.patch(
            f"{BASE_URL}/api/test-history/{entry_id}/annotate",
            json={"annotation": test_annotation}
        )
        assert patch_response.status_code == 200
        result = patch_response.json()
        assert result.get("updated") == True
        print(f"Annotation saved for entry {entry_id}")
        
        # Verify annotation was saved
        verify_response = requests.get(f"{BASE_URL}/api/test-history")
        verify_data = verify_response.json()
        updated_entry = next((e for e in verify_data if e["id"] == entry_id), None)
        
        assert updated_entry is not None
        assert updated_entry.get("annotation") == test_annotation
        print(f"Annotation verified: {updated_entry.get('annotation')}")


class TestWarmupEndpoint:
    """Warmup Lambda endpoint tests"""
    
    def test_warmup_endpoint(self):
        """Test POST /api/warmup warms up Lambda"""
        response = requests.post(f"{BASE_URL}/api/warmup")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "message" in data
        assert "lambda_invocations" in data
        print(f"Warmup response: success={data['success']}, message={data['message']}")


class TestLiveTestEndpoint:
    """Live test endpoint tests (runs against real AWS)"""
    
    def test_warmup_profile_test(self):
        """Test POST /api/test with warmup profile"""
        response = requests.post(
            f"{BASE_URL}/api/test",
            json={"profile": "warmup"},
            timeout=120  # Extended timeout for real AWS test
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "sent" in data
        assert "received" in data
        assert "stats" in data
        assert "distribution" in data
        assert "throughput" in data
        
        # Verify stats structure
        stats = data["stats"]
        assert "min" in stats
        assert "avg" in stats
        assert "median" in stats
        assert "p95" in stats
        assert "max" in stats
        
        # Verify distribution structure
        dist = data["distribution"]
        assert "fast" in dist
        assert "ok" in dist
        assert "slow" in dist
        
        print(f"Test results: sent={data['sent']}, received={data['received']}")
        print(f"Stats: min={stats['min']}ms, avg={stats['avg']}ms, p95={stats['p95']}ms")
        print(f"Throughput: {data['throughput']}/s")
        
        # Optional fields that should exist for full tests
        if "latency_breakdown" in data and data["latency_breakdown"]:
            breakdown = data["latency_breakdown"]
            print(f"Latency breakdown: {breakdown}")
            assert "sqs_input_accept" in breakdown
            assert "lambda_compute" in breakdown
        
        if "bottleneck_analysis" in data and data["bottleneck_analysis"]:
            bottleneck = data["bottleneck_analysis"]
            print(f"Bottleneck: {bottleneck['primary_bottleneck']}")
            assert "primary_bottleneck" in bottleneck
            assert "recommendation" in bottleneck


class TestStatusEndpoint:
    """Status check CRUD tests"""
    
    def test_create_and_get_status(self):
        """Test POST and GET /api/status"""
        # Create status check
        test_client = "pytest_test_client"
        post_response = requests.post(
            f"{BASE_URL}/api/status",
            json={"client_name": test_client}
        )
        assert post_response.status_code == 200
        created = post_response.json()
        assert created["client_name"] == test_client
        print(f"Created status check: {created['id']}")
        
        # Get status checks
        get_response = requests.get(f"{BASE_URL}/api/status")
        assert get_response.status_code == 200
        status_list = get_response.json()
        assert isinstance(status_list, list)
        
        # Verify created entry exists
        found = any(s["client_name"] == test_client for s in status_list)
        assert found, "Created status check not found in list"
        print(f"Total status checks: {len(status_list)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
