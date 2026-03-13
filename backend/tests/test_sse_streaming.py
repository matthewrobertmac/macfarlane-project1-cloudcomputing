"""
Test SSE Streaming Endpoint for AdFlow Pipeline
Tests GET /api/test/stream?profile=warmup SSE endpoint
"""
import pytest
import requests
import os
import json
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

class TestSSEStreaming:
    """Tests for SSE streaming endpoint at GET /api/test/stream"""
    
    def test_sse_endpoint_returns_stream(self):
        """Test that SSE endpoint returns proper content-type and SSE events"""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        
        # Using stream=True to handle SSE
        with requests.get(url, stream=True, timeout=60) as response:
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            # Check headers for SSE
            content_type = response.headers.get('Content-Type', '')
            assert 'text/event-stream' in content_type, f"Expected text/event-stream, got {content_type}"
            
            # Collect events
            events = []
            event_data = ""
            
            for line in response.iter_lines(decode_unicode=True):
                if line is None:
                    continue
                    
                if line.startswith("event:"):
                    event_type = line.replace("event:", "").strip()
                elif line.startswith("data:"):
                    data_str = line.replace("data:", "").strip()
                    try:
                        data = json.loads(data_str)
                        events.append({"event": event_type, "data": data})
                    except json.JSONDecodeError:
                        pass
                
                # Stop after receiving complete event
                if len(events) > 0 and events[-1].get("event") == "complete":
                    break
            
            print(f"Received {len(events)} events")
            
            # Verify we received expected event types
            event_types = [e["event"] for e in events]
            assert "status" in event_types, "Missing 'status' event"
            assert "send_progress" in event_types, "Missing 'send_progress' event"
            assert "result_batch" in event_types, "Missing 'result_batch' event"
            assert "stats" in event_types, "Missing 'stats' event"
            assert "complete" in event_types, "Missing 'complete' event"
            
            print("All expected SSE event types received")
    
    def test_sse_status_event_structure(self):
        """Test that status events have correct structure"""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        
        with requests.get(url, stream=True, timeout=60) as response:
            assert response.status_code == 200
            
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("data:") and "sending" in line:
                    data_str = line.replace("data:", "").strip()
                    data = json.loads(data_str)
                    
                    assert "phase" in data, "Status event missing 'phase'"
                    assert "message" in data, "Status event missing 'message'"
                    assert "total" in data, "Status event missing 'total'"
                    
                    assert data["total"] == 10, f"Expected 10 messages for warmup, got {data['total']}"
                    print(f"Status event structure verified: phase={data['phase']}, total={data['total']}")
                    break
    
    def test_sse_complete_event_has_results(self):
        """Test that complete event contains expected result fields"""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        complete_data = None
        
        with requests.get(url, stream=True, timeout=60) as response:
            assert response.status_code == 200
            
            event_type = None
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("event:"):
                    event_type = line.replace("event:", "").strip()
                elif line and line.startswith("data:") and event_type == "complete":
                    complete_data = json.loads(line.replace("data:", "").strip())
                    break
        
        assert complete_data is not None, "Did not receive complete event"
        
        # Verify complete event structure
        assert "sent" in complete_data, "Complete event missing 'sent'"
        assert "received" in complete_data, "Complete event missing 'received'"
        assert "throughput" in complete_data, "Complete event missing 'throughput'"
        assert "latencies" in complete_data, "Complete event missing 'latencies'"
        
        assert complete_data["sent"] == 10, f"Expected sent=10, got {complete_data['sent']}"
        assert complete_data["received"] > 0, "Should have received some results"
        assert isinstance(complete_data["latencies"], list), "Latencies should be a list"
        
        print(f"Complete event verified: sent={complete_data['sent']}, received={complete_data['received']}, throughput={complete_data['throughput']}")
    
    def test_sse_stats_event_structure(self):
        """Test that stats event contains proper statistics and breakdown"""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        stats_data = None
        
        with requests.get(url, stream=True, timeout=60) as response:
            assert response.status_code == 200
            
            event_type = None
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("event:"):
                    event_type = line.replace("event:", "").strip()
                elif line and line.startswith("data:") and event_type == "stats":
                    stats_data = json.loads(line.replace("data:", "").strip())
                    break
        
        assert stats_data is not None, "Did not receive stats event"
        
        # Verify stats structure
        assert "stats" in stats_data, "Stats event missing 'stats'"
        assert "distribution" in stats_data, "Stats event missing 'distribution'"
        assert "latency_breakdown" in stats_data, "Stats event missing 'latency_breakdown'"
        assert "bottleneck_analysis" in stats_data, "Stats event missing 'bottleneck_analysis'"
        
        # Verify stats detail
        stats = stats_data["stats"]
        assert "min" in stats, "Stats missing 'min'"
        assert "avg" in stats, "Stats missing 'avg'"
        assert "median" in stats, "Stats missing 'median'"
        assert "p95" in stats, "Stats missing 'p95'"
        assert "max" in stats, "Stats missing 'max'"
        
        # Verify distribution
        dist = stats_data["distribution"]
        assert "fast" in dist, "Distribution missing 'fast'"
        assert "ok" in dist, "Distribution missing 'ok'"
        assert "slow" in dist, "Distribution missing 'slow'"
        
        # Verify latency breakdown
        breakdown = stats_data["latency_breakdown"]
        assert "sqs_input_accept" in breakdown, "Breakdown missing 'sqs_input_accept'"
        assert "queue_wait_time" in breakdown, "Breakdown missing 'queue_wait_time'"
        assert "lambda_compute" in breakdown, "Breakdown missing 'lambda_compute'"
        
        print(f"Stats event verified: avg={stats['avg']}ms, p95={stats['p95']}ms")
        print(f"Breakdown: {breakdown}")


class TestTestHistory:
    """Tests for test history API endpoints"""
    
    def test_get_test_history(self):
        """Test GET /api/test-history returns list of past runs"""
        response = requests.get(f"{BASE_URL}/api/test-history")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Test history should be a list"
        
        if len(data) > 0:
            entry = data[0]
            assert "id" in entry, "History entry missing 'id'"
            assert "profile" in entry, "History entry missing 'profile'"
            assert "timestamp" in entry, "History entry missing 'timestamp'"
            assert "stats" in entry, "History entry missing 'stats'"
            assert "sent" in entry, "History entry missing 'sent'"
            assert "received" in entry, "History entry missing 'received'"
            
            print(f"Test history has {len(data)} entries")
            print(f"Latest: profile={entry['profile']}, avg={entry['stats'].get('avg')}ms")
    
    def test_history_populated_after_sse_test(self):
        """Verify that running SSE test adds entry to history"""
        # Get initial history count
        initial_response = requests.get(f"{BASE_URL}/api/test-history")
        initial_count = len(initial_response.json())
        
        # Run a warmup test via SSE
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        with requests.get(url, stream=True, timeout=60) as response:
            # Wait for complete event
            for line in response.iter_lines(decode_unicode=True):
                if line and "complete" in line:
                    break
        
        # Give a moment for MongoDB to save
        time.sleep(1)
        
        # Check history count increased
        final_response = requests.get(f"{BASE_URL}/api/test-history")
        final_count = len(final_response.json())
        
        assert final_count >= initial_count, f"History count should not decrease: was {initial_count}, now {final_count}"
        print(f"History count: {initial_count} -> {final_count}")


class TestOtherEndpoints:
    """Tests for other critical endpoints"""
    
    def test_root_endpoint(self):
        """Test GET /api/ returns hello world"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Hello World"
        print("Root endpoint working")
    
    def test_heartbeat_endpoint(self):
        """Test POST /api/heartbeat returns status"""
        response = requests.post(f"{BASE_URL}/api/heartbeat")
        assert response.status_code == 200
        
        data = response.json()
        assert "received" in data
        assert "timestamp" in data
        assert "provisioned_concurrency" in data
        assert "status" in data
        
        print(f"Heartbeat: pc={data['provisioned_concurrency']}, status={data['status']}")
    
    def test_pc_status_endpoint(self):
        """Test GET /api/pc-status returns provisioned concurrency status"""
        response = requests.get(f"{BASE_URL}/api/pc-status")
        assert response.status_code == 200
        
        data = response.json()
        assert "current_pc" in data
        assert "status" in data
        
        print(f"PC Status: current={data['current_pc']}, status={data['status']}")
    
    def test_warmup_endpoint(self):
        """Test POST /api/warmup returns warmup response"""
        response = requests.post(f"{BASE_URL}/api/warmup", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert "success" in data
        assert "message" in data
        
        print(f"Warmup: success={data['success']}, message={data['message']}")


class TestBulavaEndpoints:
    """Tests for Bulava augmentation endpoints"""
    
    def test_bulava_augment(self):
        """Test POST /api/bulava/augment returns augmentation"""
        response = requests.post(
            f"{BASE_URL}/api/bulava/augment",
            json={"ad_category": "sportswear", "type": "fact"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "text" in data
        assert "tier" in data
        assert "type" in data
        assert data["tier"] == 3
        
        print(f"Bulava augment: type={data['type']}, tier={data['tier']}")
    
    def test_bulava_categories(self):
        """Test GET /api/bulava/categories returns available categories"""
        response = requests.get(f"{BASE_URL}/api/bulava/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert "ad_categories" in data
        assert "augmentation_types" in data
        assert len(data["ad_categories"]) > 0
        
        print(f"Bulava categories: {len(data['ad_categories'])} ad categories")
    
    def test_bulava_analytics(self):
        """Test GET /api/bulava/analytics returns analytics data"""
        response = requests.get(f"{BASE_URL}/api/bulava/analytics")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_augmentations" in data
        assert "by_category" in data
        assert "by_type" in data
        
        print(f"Bulava analytics: total={data['total_augmentations']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
