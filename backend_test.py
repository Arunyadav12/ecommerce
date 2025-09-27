#!/usr/bin/env python3
"""
Backend API Testing Script for WholeMart E-commerce Platform
Tests all backend endpoints with proper authentication and error handling.
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class WholemartAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_data = {
            "shop_name": "Fresh Mart Store",
            "mobile": "+91 9876543210",
            "location": "MG Road, Bangalore, Karnataka",
            "password": "testpass123"
        }
        self.test_results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response_data"] = response_data
            
        self.test_results.append(result)
        
    def test_health_check(self):
        """Test API health check endpoint"""
        try:
            response = self.session.get(f"{API_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "WholeMart API" in data["message"]:
                    self.log_result("Health Check", True, f"API is running - {data['message']}")
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            response = self.session.post(f"{API_URL}/auth/register", json=self.user_data)
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "token" in data:
                    self.auth_token = data["token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_result("User Registration", True, f"User registered successfully - ID: {data['user']['id']}")
                    return True
                else:
                    self.log_result("User Registration", False, f"Missing user or token in response: {data}")
                    return False
            elif response.status_code == 400:
                # User might already exist, try login instead
                self.log_result("User Registration", True, "User already exists (expected for repeated tests)")
                return True
            else:
                self.log_result("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Request error: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        try:
            login_data = {
                "mobile": self.user_data["mobile"],
                "password": self.user_data["password"]
            }
            response = self.session.post(f"{API_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "token" in data:
                    self.auth_token = data["token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_result("User Login", True, f"Login successful - User: {data['user']['shop_name']}")
                    return True
                else:
                    self.log_result("User Login", False, f"Missing user or token in response: {data}")
                    return False
            else:
                self.log_result("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("User Login", False, f"Request error: {str(e)}")
            return False
    
    def test_get_current_user(self):
        """Test get current user endpoint (requires authentication)"""
        if not self.auth_token:
            self.log_result("Get Current User", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_URL}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "shop_name" in data:
                    self.log_result("Get Current User", True, f"User info retrieved - Shop: {data['shop_name']}")
                    return True
                else:
                    self.log_result("Get Current User", False, f"Missing user fields in response: {data}")
                    return False
            else:
                self.log_result("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Get Current User", False, f"Request error: {str(e)}")
            return False
    
    def test_get_products(self):
        """Test get products endpoint"""
        try:
            response = self.session.get(f"{API_URL}/products")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    product = data[0]
                    required_fields = ["id", "name", "price", "category", "unit", "min_order"]
                    if all(field in product for field in required_fields):
                        self.log_result("Get Products", True, f"Retrieved {len(data)} products")
                        return True
                    else:
                        self.log_result("Get Products", False, f"Missing required fields in product: {product}")
                        return False
                else:
                    self.log_result("Get Products", False, f"Expected non-empty list, got: {data}")
                    return False
            else:
                self.log_result("Get Products", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Get Products", False, f"Request error: {str(e)}")
            return False
    
    def test_get_categories(self):
        """Test get categories endpoint"""
        try:
            response = self.session.get(f"{API_URL}/categories")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    category = data[0]
                    required_fields = ["id", "name", "icon"]
                    if all(field in category for field in required_fields):
                        self.log_result("Get Categories", True, f"Retrieved {len(data)} categories")
                        return True
                    else:
                        self.log_result("Get Categories", False, f"Missing required fields in category: {category}")
                        return False
                else:
                    self.log_result("Get Categories", False, f"Expected non-empty list, got: {data}")
                    return False
            else:
                self.log_result("Get Categories", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Get Categories", False, f"Request error: {str(e)}")
            return False
    
    def test_create_order(self):
        """Test create order endpoint (requires authentication)"""
        if not self.auth_token:
            self.log_result("Create Order", False, "No auth token available")
            return False
            
        try:
            # Sample order data
            order_data = {
                "items": [
                    {
                        "product_id": "prod1",
                        "name": "Onion 1kg",
                        "quantity": 5,
                        "price": 45.0,
                        "unit": "kg"
                    },
                    {
                        "product_id": "prod2",
                        "name": "Potato 1kg", 
                        "quantity": 10,
                        "price": 35.0,
                        "unit": "kg"
                    }
                ],
                "total": 625.0,  # (45*5 + 35*10) + 50 delivery fee = 225 + 350 + 50 = 625
                "delivery_address": "123 Test Street, Test City, Test State - 123456"
            }
            
            response = self.session.post(f"{API_URL}/orders", json=order_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "order_id", "user_id", "items", "total", "status"]
                if all(field in data for field in required_fields):
                    self.log_result("Create Order", True, f"Order created - ID: {data['order_id']}")
                    return True
                else:
                    self.log_result("Create Order", False, f"Missing required fields in order: {data}")
                    return False
            else:
                self.log_result("Create Order", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Create Order", False, f"Request error: {str(e)}")
            return False
    
    def test_get_user_orders(self):
        """Test get user orders endpoint (requires authentication)"""
        if not self.auth_token:
            self.log_result("Get User Orders", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_URL}/orders")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        order = data[0]
                        required_fields = ["id", "order_id", "user_id", "items", "total", "status"]
                        if all(field in order for field in required_fields):
                            self.log_result("Get User Orders", True, f"Retrieved {len(data)} orders")
                            return True
                        else:
                            self.log_result("Get User Orders", False, f"Missing required fields in order: {order}")
                            return False
                    else:
                        self.log_result("Get User Orders", True, "No orders found (empty list)")
                        return True
                else:
                    self.log_result("Get User Orders", False, f"Expected list, got: {data}")
                    return False
            else:
                self.log_result("Get User Orders", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Get User Orders", False, f"Request error: {str(e)}")
            return False
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            invalid_data = {
                "mobile": "+91 9999999999",
                "password": "wrongpassword"
            }
            response = self.session.post(f"{API_URL}/auth/login", json=invalid_data)
            
            if response.status_code == 401:
                self.log_result("Invalid Login", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_result("Invalid Login", False, f"Expected 401, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Invalid Login", False, f"Request error: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        try:
            # Remove auth header temporarily
            original_headers = self.session.headers.copy()
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            response = self.session.get(f"{API_URL}/auth/me")
            
            # Restore headers
            self.session.headers.update(original_headers)
            
            if response.status_code in [401, 403]:
                self.log_result("Unauthorized Access", True, f"Correctly rejected unauthorized request (HTTP {response.status_code})")
                return True
            else:
                self.log_result("Unauthorized Access", False, f"Expected 401 or 403, got {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Unauthorized Access", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"🚀 Starting WholeMart API Tests")
        print(f"📍 Testing API at: {API_URL}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Get Products", self.test_get_products),
            ("Get Categories", self.test_get_categories),
            ("Create Order", self.test_create_order),
            ("Get User Orders", self.test_get_user_orders),
            ("Invalid Login", self.test_invalid_login),
            ("Unauthorized Access", self.test_unauthorized_access)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution error: {str(e)}")
                failed += 1
            print()  # Add spacing between tests
        
        # Summary
        print("=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        return failed == 0

def main():
    """Main function to run tests"""
    tester = WholemartAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()