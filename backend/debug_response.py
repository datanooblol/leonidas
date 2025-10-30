import requests

# Your existing code
base_url = "http://localhost:8000"  # or your actual base URL
session_id = "your_session_id"  # replace with actual session ID

data = dict(content="Hi. My name is Bank. How are you, bro?")
model_response = requests.post(f"{base_url}/sessions/{session_id}/chat", json=data)

print(f"Status Code: {model_response.status_code}")
print(f"Headers: {model_response.headers}")
print(f"Raw Response: {repr(model_response.text)}")
print(f"Content Length: {len(model_response.text)}")

# Only try to parse JSON if we have content and status is 200
if model_response.status_code == 200 and model_response.text.strip():
    try:
        json_response = model_response.json()
        print(f"JSON Response: {json_response}")
        if 'content' in json_response:
            print(f"Content: {json_response['content']}")
    except Exception as e:
        print(f"JSON Parse Error: {e}")
else:
    print("Response is not successful or empty")