# leonidas
This is a repo for AI Data Scientist

## Infrastructure
- AWS Infrastructure managed with Terraform

## GitHub Actions Setup

To enable CI/CD workflows, add these secrets to your GitHub repository:

### Required GitHub Secrets

1. **AWS_ACCESS_KEY_ID**
2. **AWS_SECRET_ACCESS_KEY** 
3. **AWS_ACCOUNT_ID**

### Find Your AWS Credentials

Run these commands to get your AWS credentials:

```bash
# Get AWS Account ID
aws sts get-caller-identity --query Account

# Get Access Key ID
aws configure get aws_access_key_id

# Get Secret Access Key
aws configure get aws_secret_access_key
```

### Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the values from the commands above
