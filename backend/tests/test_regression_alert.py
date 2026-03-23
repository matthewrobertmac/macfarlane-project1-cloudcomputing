"""
Test suite for Performance Regression Alert feature and orjson optimizations.
Tests: SSE regression_alert field, test history regression_alert, orjson serialization.
"""
import pytest
import requests
import os
import json
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRegressionAlertFeature:
    """Tests for the Performance Regression Alert feature in SSE streaming."""
    
    def test_sse_stream_returns_regression_alert_in_stats(self):
        """SSE endpoint /api/test/stream?profile=warmup returns regression_alert in stats event."""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        
        # Use requests with stream=True to read SSE events
        response = requests.get(url, stream=True, timeout=120)
        assert response.status_code == 200
        assert 'text/event-stream' in response.headers.get('Content-Type', '')
        
        stats_event_found = False
        regression_alert = None
        
        # Read SSE events
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith('data:'):
                data_str = line[5:].strip()
                try:
                    data = json.loads(data_str)
                    # Check if this is the stats event (contains 'stats' and 'regression_alert')
                    if 'stats' in data and 'regression_alert' in data:
                        stats_event_found = True
                        regression_alert = data.get('regression_alert')
                        break
                except json.JSONDecodeError:
                    continue
        
        response.close()
        
        assert stats_event_found, "Stats event with regression_alert not found in SSE stream"
        
        # regression_alert can be None if no history exists, or a dict with type
        if regression_alert is not None:
            assert 'type' in regression_alert, "regression_alert missing 'type' field"
            assert regression_alert['type'] in ['personal_best', 'regression', 'normal'], \
                f"Invalid regression_alert type: {regression_alert['type']}"
            assert 'current_avg' in regression_alert, "regression_alert missing 'current_avg'"
            
            # Check type-specific fields
            if regression_alert['type'] == 'personal_best':
                assert 'previous_best_avg' in regression_alert, "personal_best missing 'previous_best_avg'"
                assert 'improvement_pct' in regression_alert, "personal_best missing 'improvement_pct'"
            elif regression_alert['type'] == 'regression':
                assert 'best_avg' in regression_alert, "regression missing 'best_avg'"
                assert 'regression_pct' in regression_alert, "regression missing 'regression_pct'"
            elif regression_alert['type'] == 'normal':
                assert 'best_avg' in regression_alert, "normal missing 'best_avg'"
                assert 'delta_pct' in regression_alert, "normal missing 'delta_pct'"
        
        print(f"PASS: SSE stats event contains regression_alert: {regression_alert}")
    
    def test_test_history_contains_regression_alert(self):
        """Test history endpoint returns entries with regression_alert field."""
        response = requests.get(f"{BASE_URL}/api/test-history", timeout=30)
        assert response.status_code == 200
        
        history = response.json()
        assert isinstance(history, list), "Test history should be a list"
        
        # Find entries with regression_alert (newer entries should have it)
        entries_with_alert = [e for e in history if 'regression_alert' in e and e['regression_alert'] is not None]
        
        assert len(entries_with_alert) > 0, "No test history entries found with regression_alert field"
        
        # Validate structure of first entry with regression_alert
        entry = entries_with_alert[0]
        alert = entry['regression_alert']
        
        assert 'type' in alert, "regression_alert missing 'type'"
        assert alert['type'] in ['personal_best', 'regression', 'normal'], \
            f"Invalid type: {alert['type']}"
        assert 'current_avg' in alert, "regression_alert missing 'current_avg'"
        
        print(f"PASS: Found {len(entries_with_alert)} history entries with regression_alert")
        print(f"Sample alert: type={alert['type']}, current_avg={alert['current_avg']}")


class TestOrjsonSerialization:
    """Tests to verify orjson is being used correctly for SQS message serialization."""
    
    def test_sse_stream_messages_parse_correctly(self):
        """Verify SSE messages are valid JSON (orjson serialization works)."""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        
        response = requests.get(url, stream=True, timeout=120)
        assert response.status_code == 200
        
        events_parsed = 0
        parse_errors = []
        
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith('data:'):
                data_str = line[5:].strip()
                try:
                    data = json.loads(data_str)
                    events_parsed += 1
                    
                    # Verify common fields are present and valid types
                    if 'stats' in data:
                        stats = data['stats']
                        assert isinstance(stats.get('min'), (int, float)), "stats.min should be numeric"
                        assert isinstance(stats.get('avg'), (int, float)), "stats.avg should be numeric"
                except json.JSONDecodeError as e:
                    parse_errors.append(f"Failed to parse: {data_str[:100]}... Error: {e}")
        
        response.close()
        
        assert events_parsed > 0, "No SSE events were parsed"
        assert len(parse_errors) == 0, f"JSON parse errors: {parse_errors}"
        
        print(f"PASS: Successfully parsed {events_parsed} SSE events with orjson serialization")
    
    def test_warmup_endpoint_returns_valid_json(self):
        """POST /api/warmup returns valid JSON response."""
        response = requests.post(f"{BASE_URL}/api/warmup", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert 'success' in data, "warmup response missing 'success'"
        assert 'message' in data, "warmup response missing 'message'"
        assert isinstance(data['success'], bool), "success should be boolean"
        
        print(f"PASS: Warmup endpoint returns valid JSON: success={data['success']}")


class TestStartupOptimizations:
    """Tests for startup optimizations (connection pre-warming, thread pool)."""
    
    def test_backend_health_check(self):
        """Verify backend is running and responding."""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get('message') == 'Hello World'
        print("PASS: Backend health check passed")
    
    def test_heartbeat_endpoint(self):
        """POST /api/heartbeat returns valid response."""
        response = requests.post(f"{BASE_URL}/api/heartbeat", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert 'received' in data, "heartbeat missing 'received'"
        assert 'timestamp' in data, "heartbeat missing 'timestamp'"
        assert 'provisioned_concurrency' in data, "heartbeat missing 'provisioned_concurrency'"
        assert 'status' in data, "heartbeat missing 'status'"
        
        print(f"PASS: Heartbeat endpoint working, PC={data['provisioned_concurrency']}, status={data['status']}")
    
    def test_pc_status_endpoint(self):
        """GET /api/pc-status returns valid response."""
        response = requests.get(f"{BASE_URL}/api/pc-status", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert 'current_pc' in data, "pc-status missing 'current_pc'"
        assert 'status' in data, "pc-status missing 'status'"
        
        print(f"PASS: PC status endpoint working, current_pc={data['current_pc']}, status={data['status']}")


class TestAllProfilesWork:
    """Tests to verify all test profiles still work correctly."""
    
    def test_warmup_profile_works(self):
        """Warmup profile (10 messages) completes successfully."""
        url = f"{BASE_URL}/api/test/stream?profile=warmup"
        
        response = requests.get(url, stream=True, timeout=120)
        assert response.status_code == 200
        
        complete_event = None
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith('data:'):
                data_str = line[5:].strip()
                try:
                    data = json.loads(data_str)
                    if 'sent' in data and 'received' in data and 'throughput' in data:
                        complete_event = data
                except json.JSONDecodeError:
                    continue
        
        response.close()
        
        assert complete_event is not None, "Complete event not found"
        assert complete_event['sent'] == 10, f"Expected 10 sent, got {complete_event['sent']}"
        assert complete_event['received'] > 0, "No messages received"
        
        print(f"PASS: Warmup profile completed - sent={complete_event['sent']}, received={complete_event['received']}")
    
    def test_steady_profile_works(self):
        """Steady profile (100 messages) completes successfully."""
        url = f"{BASE_URL}/api/test/stream?profile=steady"
        
        response = requests.get(url, stream=True, timeout=180)
        assert response.status_code == 200
        
        complete_event = None
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith('data:'):
                data_str = line[5:].strip()
                try:
                    data = json.loads(data_str)
                    if 'sent' in data and 'received' in data and 'throughput' in data:
                        complete_event = data
                except json.JSONDecodeError:
                    continue
        
        response.close()
        
        assert complete_event is not None, "Complete event not found"
        assert complete_event['sent'] == 100, f"Expected 100 sent, got {complete_event['sent']}"
        assert complete_event['received'] > 0, "No messages received"
        
        print(f"PASS: Steady profile completed - sent={complete_event['sent']}, received={complete_event['received']}")


class TestOptimizationJourneyCard:
    """Tests related to the Optimization Journey feature."""
    
    def test_test_history_has_stats_for_comparison(self):
        """Test history has entries with stats for Optimization Journey comparison."""
        response = requests.get(f"{BASE_URL}/api/test-history", timeout=30)
        assert response.status_code == 200
        
        history = response.json()
        assert len(history) > 0, "Test history is empty"
        
        # Check that entries have required fields for comparison
        entry = history[0]
        assert 'profile' in entry, "Entry missing 'profile'"
        assert 'stats' in entry, "Entry missing 'stats'"
        assert 'avg' in entry['stats'], "Entry stats missing 'avg'"
        assert 'p95' in entry['stats'], "Entry stats missing 'p95'"
        assert 'throughput' in entry, "Entry missing 'throughput'"
        
        print(f"PASS: Test history has {len(history)} entries with stats for comparison")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
