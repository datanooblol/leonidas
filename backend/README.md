# Backend API Documentation

## Tech Stack

- **Framework**: FastAPI
- **Database**: DynamoDB
- **File Storage**: S3
- **AI**: AWS Bedrock
- **Authentication**: JWT tokens

## API Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
POST /auth/logout
```

### Projects

```
GET /projects                    # List user's projects
POST /projects                   # Create new project
GET /projects/{id}               # Get project details
PUT /projects/{id}               # Update project
DELETE /projects/{id}            # Delete project
```

### Sessions

```
GET /projects/{project_id}/sessions    # List sessions in project
POST /projects/{project_id}/sessions   # Create new session
GET /sessions/{id}                     # Get session with messages
PUT /sessions/{id}                     # Update session
DELETE /sessions/{id}                  # Delete session
```

### Files

```
POST /projects/{project_id}/files      # Upload CSV
GET /projects/{project_id}/files       # List project files
DELETE /files/{id}                     # Delete file
```

### Chat

```
POST /sessions/{id}/messages           # Send message & get AI response
GET /sessions/{id}/messages            # Get message history
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
POST /sessions/{session_id}/messages
Authorization: Bearer {jwt_token}
{
  "content": "How should I analyze this customer data?"
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

1. Install dependencies: `pip install -r requirements.txt`
2. Configure AWS credentials
3. Set environment variables for DynamoDB/S3
4. Run locally: `uvicorn main:app --reload`
