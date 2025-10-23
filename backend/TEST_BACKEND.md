# Backend API Testing Guide

This guide demonstrates how to test the Leonidas backend API endpoints using Python requests.

## Prerequisites

```python
import requests
from io import StringIO
import pandas as pd

base_url = "https://leonidas-api.datanooblol.com"
```

## 1. User Registration

Register a new user account:

```python
login_data = {
    "email": "user@example.com",
    "password": "string"
}

response = requests.post(f"{base_url}/auth/register", json=login_data)
print(response.json())
```

**Expected Response:**
```json
{
  "user_id": "fc7dd676-617b-4a5a-b9b9-31ad6ebc9d4a",
  "email": "user@example.com", 
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 2. User Login

Login with existing credentials:

```python
login_response = requests.post(f"{base_url}/auth/login", json=login_data)
print(login_response.json())
```

## 3. Setup Session with Authentication

Use requests.Session() for automatic token handling:

```python
session = requests.Session()

# Login and set auth token
login_response = session.post(f"{base_url}/auth/login", json=login_data)
token = login_response.json()['access_token']
session.headers.update({"Authorization": f"Bearer {token}"})
```

## 4. List Projects

Get all projects for the authenticated user:

```python
projects = session.get(f"{base_url}/projects").json()
print(projects['projects'])
```

**Expected Response:**
```json
{"projects": []}
```

## 5. Create Project

Create a new project:

```python
project_data = {
    "name": "bank test from python",
    "description": "Testing project creation from notebook"
}

new_project = session.post(f"{base_url}/projects", json=project_data).json()
print(new_project)
```

**Expected Response:**
```json
{
  "project_id": "0e12b36e-ee9b-4f8a-ac35-bbee902e60e6",
  "name": "bank test from python",
  "description": "Testing project creation from notebook",
  "created_at": "2025-10-23T16:12:07.582708Z",
  "updated_at": "2025-10-23T16:12:07.582721Z"
}
```

## 6. File Upload Process

### Step 1: Create CSV Data

```python
# Create CSV data in memory
csv_data = StringIO()
csv_data.write("name,age,city\n")
csv_data.write("John,25,NYC\n")
csv_data.write("Jane,30,LA\n")
csv_content = csv_data.getvalue().encode('utf-8')
```

### Step 2: Get Presigned Upload URL

```python
project_id = projects['projects'][0]['project_id']

upload_url_response = session.post(
    f"{base_url}/projects/{project_id}/files/upload-url?filename=test.csv"
)
upload_data = upload_url_response.json()
```

### Step 3: Upload File to S3

```python
upload_response = requests.post(
    upload_data["url"], 
    data=upload_data["fields"], 
    files={"file": csv_content}
)

print(f"Upload status: {upload_response.status_code}")  # Should be 204
```

### Step 4: Confirm Upload

```python
file_id = upload_data["file_id"]
file_size = len(csv_content)

confirm_response = session.post(
    f"{base_url}/files/{file_id}/confirm?size={file_size}"
)

print(f"Confirm status: {confirm_response.status_code}")
print(f"File confirmed: {confirm_response.json()}")
```

## 7. List Project Files

Verify the uploaded file:

```python
files_response = session.get(f"{base_url}/projects/{project_id}/files")
print(f"Files: {files_response.json()}")
```

**Expected Response:**
```json
{
  "files": [
    {
      "file_id": "53e1da15-e0c1-4903-8c73-bf2dd65a3ed3",
      "project_id": "0e12b36e-ee9b-4f8a-ac35-bbee902e60e6",
      "filename": "test.csv",
      "size": 37,
      "status": "completed",
      "source": "user_upload",
      "created_at": "2025-10-23T16:24:31.978637Z",
      "updated_at": "2025-10-23T16:30:06.438112Z"
    }
  ]
}
```

## 8. Download File

### Step 1: Get Download URL

```python
download_url_response = session.get(f"{base_url}/files/{file_id}/download-url")
download_data = download_url_response.json()
```

### Step 2: Download File Content

```python
download_response = requests.get(download_data["url"])

print(f"Download status: {download_response.status_code}")
print(f"File content: {download_response.text}")
```

**Expected Output:**
```
Download status: 200
File content: name,age,city
John,25,NYC
Jane,30,LA
```

### Step 3: Process CSV Data

```python
import pandas as pd
from io import StringIO

csv_content = download_response.text
df = pd.read_csv(StringIO(csv_content))
print(df)
```

**Expected Output:**
```
   name  age city
0  John   25  NYC
1  Jane   30   LA
```

## Complete Test Flow

Here's a complete test that runs all operations:

```python
import requests
from io import StringIO
import pandas as pd

def test_complete_flow():
    base_url = "https://leonidas-api.datanooblol.com"
    session = requests.Session()
    
    # 1. Register/Login
    login_data = {"email": "user@example.com", "password": "string"}
    login_response = session.post(f"{base_url}/auth/login", json=login_data)
    token = login_response.json()['access_token']
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # 2. Create Project
    project_data = {"name": "Test Project", "description": "API Test"}
    project = session.post(f"{base_url}/projects", json=project_data).json()
    project_id = project['project_id']
    
    # 3. Upload File
    csv_data = StringIO()
    csv_data.write("name,age,city\nJohn,25,NYC\nJane,30,LA\n")
    csv_content = csv_data.getvalue().encode('utf-8')
    
    upload_url_response = session.post(f"{base_url}/projects/{project_id}/files/upload-url?filename=test.csv")
    upload_data = upload_url_response.json()
    
    upload_response = requests.post(upload_data["url"], data=upload_data["fields"], files={"file": csv_content})
    
    # 4. Confirm Upload
    file_id = upload_data["file_id"]
    confirm_response = session.post(f"{base_url}/files/{file_id}/confirm?size={len(csv_content)}")
    
    # 5. Download File
    download_url_response = session.get(f"{base_url}/files/{file_id}/download-url")
    download_data = download_url_response.json()
    download_response = requests.get(download_data["url"])
    
    # 6. Verify Content
    df = pd.read_csv(StringIO(download_response.text))
    print("✅ Complete test successful!")
    print(df)

# Run the test
test_complete_flow()
```

## Status Codes

- **200**: Success with response body
- **204**: Success with no response body (S3 upload)
- **400**: Bad request (invalid data)
- **401**: Unauthorized (invalid token)
- **404**: Not found (resource doesn't exist)
- **500**: Internal server error