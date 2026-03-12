#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class AdFlowAPITester:
    def __init__(self, base_url="https://score-and-select.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_json = response.json()
                    print(f"   Response: {json.dumps(response_json, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
                return True, response.json() if response.text else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_warmup_endpoint(self):
        """Test the warmup endpoint"""
        return self.run_test("AWS Warmup", "POST", "warmup", 200)

    def test_test_endpoint(self):
        """Test the test endpoint with different profiles"""
        profiles = ["warmup", "steady", "burst", "soak"]
        
        for profile in profiles:
            success, response = self.run_test(
                f"Test Profile: {profile}",
                "POST", 
                "test",
                200,
                data={"profile": profile}
            )
            if success and response:
                # Validate response structure
                required_fields = ["sent", "received", "stats", "distribution", "throughput"]
                missing_fields = [field for field in required_fields if field not in response]
                if missing_fields:
                    print(f"   ⚠️ Warning: Missing fields in response: {missing_fields}")
                else:
                    print(f"   ✅ Response structure validated")
                    print(f"   📊 Sent: {response.get('sent')}, Received: {response.get('received')}")
                    print(f"   📈 Avg Latency: {response.get('stats', {}).get('avg')}ms")
        
        return True, {}

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test POST status
        test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
        success, response = self.run_test(
            "Create Status Check",
            "POST",
            "status",
            200,
            data=test_data
        )
        
        if success:
            # Test GET status
            self.run_test("Get Status Checks", "GET", "status", 200)
        
        return success, response

def main():
    print("🚀 Starting AdFlow API Testing...")
    print("=" * 50)
    
    tester = AdFlowAPITester()
    
    # Test basic endpoints
    print("\n📋 Testing Basic API Endpoints:")
    tester.test_root_endpoint()
    tester.test_status_endpoints()
    
    # Test AdFlow specific endpoints  
    print("\n🔥 Testing AdFlow Endpoints:")
    tester.test_warmup_endpoint()
    tester.test_test_endpoint()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())