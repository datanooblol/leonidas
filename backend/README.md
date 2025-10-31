# Backend API Documentation

## Tech Stack

- **Framework**: FastAPI
- **Database**: DynamoDB
- **File Storage**: S3
- **AI**: AWS Bedrock
- **Authentication**: JWT tokens

## API Endpoints

### Base URLs

- **Production**: `your-endpoint`
- **Local Development**: `http://localhost:8000`

### Health Check

```
GET /                           # API status
GET /health                     # Health check
```

### Authentication

```
POST /auth/register             # Register new user
POST /auth/login                # Login user
```

### Projects

```
GET /projects                   # List user's projects
POST /projects                  # Create new project
GET /projects/{project_id}      # Get project details
PUT /projects/{project_id}      # Update project
DELETE /projects/{project_id}   # Delete project

# Project Sessions
GET /projects/{project_id}/sessions     # List sessions in project
POST /projects/{project_id}/sessions    # Create new session

# Project Files
GET /projects/{project_id}/files        # List files in project
POST /projects/{project_id}/files/upload-url  # Get presigned upload URL
```

### Sessions

```
GET /sessions/{session_id}      # Get session details
PUT /sessions/{session_id}      # Update session
POST /sessions/{session_id}/refresh  # Refresh/restart session
DELETE /sessions/{session_id}   # Delete session
```

### Files

```
GET /files/{file_id}/download-url    # Get presigned download URL
POST /files/{file_id}/confirm        # Confirm file upload completion
PATCH /files/{file_id}/rename        # Rename file
DELETE /files/{file_id}              # Delete file
GET /files/{file_id}/metadata        # Get file metadata
PUT /files/{file_id}/metadata        # Update file metadata
PATCH /files/{file_id}/selection     # Update file selection status
```

### Chat

```
GET /sessions/{session_id}/chat      # Get chat history
POST /sessions/{session_id}/chat     # Send message & get AI response
```

## Request/Response Examples

### Authentication

```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201
{
  "user_id": "uuid",
  "email": "user@example.com",
  "access_token": "jwt_token"
}
```

### Create Project

```json
POST /projects
Authorization: Bearer {jwt_token}
{
  "name": "Customer Analysis",
  "description": "Analyzing customer behavior data"
}

Response: 201
{
  "id": "uuid",
  "name": "Customer Analysis",
  "description": "Analyzing customer behavior data",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Send Chat Message

```json
POST /sessions/{session_id}/chat
Authorization: Bearer {jwt_token}
{
  "message": "How should I analyze this customer data?",
  "chat_with_data": true
}

Response: 200
{
  "user_message": {
    "id": "uuid",
    "content": "How should I analyze this customer data?",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "ai_response": {
    "id": "uuid",
    "content": "I'd recommend starting with exploratory data analysis...",
    "role": "assistant",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### File Upload Flow

```json
# 1. Get presigned upload URL
POST /projects/{project_id}/files/upload-url?filename=data.csv
Authorization: Bearer {jwt_token}

Response: 200
{
  "upload_url": "https://s3.amazonaws.com/...",
  "file_id": "uuid"
}

# 2. Upload file to S3 using presigned URL
PUT {upload_url}
Content-Type: text/csv
[file content]

# 3. Confirm upload completion
POST /files/{file_id}/confirm?size=1024
Authorization: Bearer {jwt_token}

Response: 200
{
  "id": "uuid",
  "filename": "data.csv",
  "size": 1024,
  "selected": false
}
```

## Database Schema

### Users Table

```
PK: user_id (string)
email (string)
password_hash (string)
created_at (string)
```

### Projects Table

```
PK: project_id (string)
user_id (string)
name (string)
description (string)
created_at (string)
```

### Sessions Table

```
PK: session_id (string)
project_id (string)
name (string)
created_at (string)
updated_at (string)
```

### Files Table

```
PK: file_id (string)
project_id (string)
filename (string)
s3_key (string)
size (number)
created_at (string)
```

### Messages Table

```
PK: message_id (string)
session_id (string)
content (string)
role (string)  # "user" or "assistant"
created_at (string)
```

## Authentication Flow

1. User registers/logs in → receives JWT token
2. All API requests include `Authorization: Bearer {token}` header
3. Lambda validates JWT and extracts user_id
4. API operations filtered by user_id for data isolation

## Deployment Steps

### Step 1: Deploy Infrastructure Foundation

```bash
cd infrastructure
terraform init
terraform apply
```

**Creates:** ECR, DynamoDB, S3, Amplify, API Gateway (without Lambda)

### Step 2: Deploy Backend Container Image

```bash
# Trigger backend CI/CD by pushing changes
echo "# deploy backend" >> backend/README.md
git add backend/README.md
git commit -m "deploy: backend container image"
git push origin main
```

**Creates:** Container image in ECR repository

### Step 3: Deploy Infrastructure with Backend Integration

```bash
# Uncomment Lambda function in infrastructure/container.tf
# Uncomment API Gateway integration in infrastructure/api.tf
cd infrastructure
terraform apply
```

**Creates:** Lambda function using ECR image + API Gateway integration

## Development Setup

1. Get inside backend: `cd backend`
2. Install dependencies: `uv sync --group dev`
3. Configure AWS credentials
4. Set environment variables for DynamoDB/S3
5. Run locally: `uv run main.py`
