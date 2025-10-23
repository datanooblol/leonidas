# Leonidas Infrastructure

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    API Gateway   │    │    Backend      │
│   (Amplify)     │◄──►│  (Custom Domain) │◄──►│   (Lambda)      │
│ www.domain.com  │    │ api.domain.com   │    │   (Container)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
                       ┌────────▼────────┐    ┌─────────────────┐
                       │   Route53 DNS   │    │   DynamoDB      │
                       │  SSL Certs      │    │   Tables        │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │   S3 Storage    │
                                              │   File Uploads  │
                                              └─────────────────┘
```

## Tech Stack

- **Frontend**: AWS Amplify (React/Vue/Next.js)
- **Backend**: Lambda Container (FastAPI + Mangum)
- **API**: API Gateway with custom domain
- **Database**: DynamoDB (5 tables)
- **Storage**: S3 for file uploads
- **Container Registry**: ECR for Lambda images
- **DNS**: Route53 with SSL certificates
- **IaC**: Terraform

## File Structure

```
infrastructure/
├── main.tf          ← Entry point & providers
├── database.tf      ← DynamoDB tables
├── storage.tf       ← S3 buckets
├── container.tf     ← ECR + Lambda container
├── api.tf          ← API Gateway + custom domain
├── frontend.tf     ← Amplify + custom domain
├── dns.tf          ← Route53 + SSL certificates
├── variables.tf    ← Input variables
└── outputs.tf      ← Output values
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** installed (>= 1.0)
3. **Domain** already in Route53 hosted zone
4. **GitHub Personal Access Token** for Amplify

## Setup

1. **Configure variables:**
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit with your values
```

2. **Deploy infrastructure:**
```bash
terraform init
terraform plan
terraform apply
```

3. **Get outputs:**
```bash
terraform output amplify_app_url
terraform output api_gateway_url
```

## Configuration Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `domain_name` | Your Route53 domain | `yourdomain.com` |
| `github_token` | GitHub PAT for Amplify | `ghp_xxx...` |
| `github_repository` | GitHub repo URL | `https://github.com/user/leonidas` |
| `aws_region` | AWS region | `ap-southeast-1` |
| `environment` | Environment name | `dev` |

## Resources Created

### Database (DynamoDB)
- **Users**: `user_id` (PK)
- **Projects**: `project_id` (PK), GSI on `user_id`
- **Sessions**: `session_id` (PK), GSI on `project_id`
- **Messages**: `message_id` (PK), GSI on `session_id` + `created_at`
- **Files**: `file_id` (PK), GSI on `project_id`

### Storage (S3)
- **File uploads bucket** with versioning
- **Public read access** for uploaded files

### Compute (Lambda)
- **Container-based Lambda** for FastAPI backend
- **ECR repository** for Docker images
- **IAM roles** with DynamoDB/S3 permissions

### API (API Gateway)
- **REST API** with Lambda integration
- **Custom domain**: `api.yourdomain.com`
- **SSL certificate** via ACM

### Frontend (Amplify)
- **Static site hosting** with CDN
- **Custom domain**: `www.yourdomain.com`
- **GitHub integration** for auto-deployment

### DNS (Route53)
- **SSL certificates** for custom domains
- **DNS records** for API and frontend
- **Certificate validation** via DNS

## Team Workflow

1. **Infrastructure Engineer**: Manages all `.tf` files
2. **Backend Developer**: Deploys to ECR → Lambda
3. **Frontend Developer**: Pushes to GitHub → Amplify
4. **CI/CD**: GitHub Actions orchestrates deployments

## Outputs

After deployment, use these URLs:
- **Frontend**: `https://www.yourdomain.com`
- **API**: `https://api.yourdomain.com`
- **Amplify Console**: Available in AWS Console