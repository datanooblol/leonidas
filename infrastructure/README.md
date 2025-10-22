# Infrastructure Setup

## Prerequisites
- AWS CLI configured with appropriate credentials
- Terraform installed

## Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

## Environment Variables
After deployment, set these environment variables for your backend:

```bash
export DYNAMODB_TABLE_PREFIX="dev_"
export AWS_REGION="us-east-1"
```

## Current Resources
- **DynamoDB Users Table**: `dev_users`
  - Primary Key: `user_id` (String)
  - Billing Mode: Pay per request

- **DynamoDB Projects Table**: `dev_projects`
  - Primary Key: `project_id` (String)
  - GSI: UserIndex on `user_id`
  - Billing Mode: Pay per request

- **DynamoDB Sessions Table**: `dev_sessions`
  - Primary Key: `session_id` (String)
  - GSI: ProjectIndex on `project_id`
  - Billing Mode: Pay per request

- **DynamoDB Messages Table**: `dev_messages`
  - Primary Key: `message_id` (String)
  - GSI: SessionIndex on `session_id` + `created_at` (for chronological order)
  - Billing Mode: Pay per request

- **DynamoDB Files Table**: `dev_files`
  - Primary Key: `file_id` (String)
  - GSI: ProjectIndex on `project_id`
  - Billing Mode: Pay per request