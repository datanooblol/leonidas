# AWS Infrastructure Architecture

## Development Environment

```mermaid
graph TB
    User[User] --> APIGW[API Gateway]
    APIGW --> Lambda[Lambda Function<br/>FastAPI Container]
    
    Lambda --> DDB[(DynamoDB)]
    Lambda --> S3[(S3 Bucket)]
    Lambda --> Bedrock[AWS Bedrock<br/>AI Models]
    
    subgraph "DynamoDB Tables"
        DDB --> Users[Users Table]
        DDB --> Projects[Projects Table]
        DDB --> Sessions[Sessions Table]
        DDB --> Files[Files Table]
        DDB --> Messages[Messages Table]
    end
    
    subgraph "S3 Storage"
        S3 --> CSV[CSV Files]
    end
    
    subgraph "Authentication"
        Lambda --> JWT[JWT Token<br/>Validation]
    end
```

## Services Overview

- **API Gateway**: REST API endpoint, handles CORS, request routing
- **Lambda**: Containerized FastAPI application, serverless compute
- **DynamoDB**: NoSQL database for all application data
- **S3**: File storage for CSV uploads
- **Bedrock**: AI/ML models for data science conversations

## Environment Configuration

- **DynamoDB Tables**: `dev_` prefix for all table names
- **S3 Bucket**: `leonidas-dev-bucket`
- **API Gateway Stage**: `dev`