import requests
import json

def test_lambda_endpoint(path="/health"):
    """Test Lambda function manually"""
    event = {
        "resource": path,
        "path": path,
        "httpMethod": "GET",
        "headers": {"Accept": "application/json"},
        "requestContext": {"stage": "test"}
    }
    
    response = requests.post(
        "http://localhost:9000/2015-03-31/functions/function/invocations",
        json=event,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    return response

if __name__ == "__main__":
    # Test health endpoint
    print("Testing /health:")
    test_lambda_endpoint("/health")
    
    print("\nTesting /:")
    test_lambda_endpoint("/")
