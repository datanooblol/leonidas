import requests
import subprocess
import time
import json
import unittest
import signal
import sys
import atexit

class TestLambdaContainer(unittest.TestCase):
    container_process = None
    container_id = None
    
    @classmethod
    def setUpClass(cls):
        """Build and start container once for all tests"""
        # Register cleanup handlers
        atexit.register(cls._force_cleanup)
        signal.signal(signal.SIGINT, cls._signal_handler)
        
        print("Building Docker image...")
        subprocess.run(["docker", "build", "-t", "leonidas-backend", "."], check=True)
        
        print("Starting container...")
        # Start container and capture container ID
        result = subprocess.run(
            ["docker", "run", "-d", "--rm", "-p", "9000:8080", "leonidas-backend"],
            capture_output=True, text=True, check=True
        )
        cls.container_id = result.stdout.strip()
        print(f"Container started with ID: {cls.container_id[:12]}")
        
        print("Waiting for container to start...")
        time.sleep(10)
        
        # Wait for container to be ready
        cls._wait_for_container()
    
    @classmethod
    def _wait_for_container(cls, max_retries=30):
        """Wait for container to be ready to accept requests"""
        for i in range(max_retries):
            try:
                event = cls._create_api_gateway_event("/health")
                response = requests.post(
                    "http://localhost:9000/2015-03-31/functions/function/invocations",
                    json=event,
                    timeout=5
                )
                if response.status_code == 200:
                    print("Container is ready!")
                    return
            except:
                time.sleep(1)
        raise Exception("Container failed to start")
    
    @classmethod
    def tearDownClass(cls):
        """Stop container after all tests"""
        cls._cleanup_container()
    
    @classmethod
    def _cleanup_container(cls):
        """Clean up container resources"""
        if cls.container_id:
            print(f"\nStopping container {cls.container_id[:12]}...")
            try:
                subprocess.run(["docker", "stop", cls.container_id], 
                             timeout=10, check=False)
                print("Container stopped successfully")
            except subprocess.TimeoutExpired:
                print("Timeout stopping container, forcing kill...")
                subprocess.run(["docker", "kill", cls.container_id], check=False)
            except Exception as e:
                print(f"Error stopping container: {e}")
            finally:
                cls.container_id = None
    
    @classmethod
    def _force_cleanup(cls):
        """Force cleanup on exit"""
        cls._cleanup_container()
    
    @classmethod
    def _signal_handler(cls, signum, frame):
        """Handle interrupt signals"""
        print("\nReceived interrupt signal, cleaning up...")
        cls._cleanup_container()
        sys.exit(0)
    
    @staticmethod
    def _create_api_gateway_event(path, method="GET"):
        return {
            "resource": path,
            "path": path,
            "httpMethod": method,
            "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            "multiValueHeaders": {},
            "queryStringParameters": None,
            "multiValueQueryStringParameters": None,
            "pathParameters": None,
            "stageVariables": None,
            "requestContext": {
                "resourceId": "abc123",
                "resourcePath": path,
                "httpMethod": method,
                "extendedRequestId": "test",
                "requestTime": "09/Apr/2015:12:34:56 +0000",
                "path": f"/test{path}",
                "accountId": "123456789012",
                "protocol": "HTTP/1.1",
                "stage": "test",
                "domainPrefix": "testPrefix",
                "requestTimeEpoch": 1428582896000,
                "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
                "identity": {"sourceIp": "127.0.0.1"},
                "domainName": "testPrefix.testDomainName",
                "apiId": "1234567890"
            },
            "body": None,
            "isBase64Encoded": False
        }
    
    def _invoke_lambda(self, path, method="GET"):
        """Helper to invoke Lambda function"""
        event = self._create_api_gateway_event(path, method)
        response = requests.post(
            "http://localhost:9000/2015-03-31/functions/function/invocations",
            json=event,
            timeout=30
        )
        return response
    
    def test_health_endpoint(self):
        """Test /health endpoint returns 200 and correct response"""
        response = self._invoke_lambda("/health")
        
        self.assertEqual(response.status_code, 200)
        
        lambda_response = response.json()
        self.assertEqual(lambda_response["statusCode"], 200)
        
        body = json.loads(lambda_response["body"])
        self.assertEqual(body["status"], "healthy")
    
    def test_root_endpoint(self):
        """Test / endpoint returns 200 and correct message"""
        response = self._invoke_lambda("/")
        
        self.assertEqual(response.status_code, 200)
        
        lambda_response = response.json()
        self.assertEqual(lambda_response["statusCode"], 200)
        
        body = json.loads(lambda_response["body"])
        self.assertEqual(body["message"], "Leonidas AI Data Scientist API")
    
    def test_nonexistent_endpoint(self):
        """Test that non-existent endpoints return 404"""
        response = self._invoke_lambda("/nonexistent")
        
        self.assertEqual(response.status_code, 200)
        
        lambda_response = response.json()
        self.assertEqual(lambda_response["statusCode"], 404)

if __name__ == "__main__":
    unittest.main(verbosity=2)
