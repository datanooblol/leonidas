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

## Deployment Steps

Follow these steps in order for initial deployment:

### 1. Deploy Infrastructure Foundation
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### 2. Deploy Backend Image
```bash
# Push backend changes to trigger GitHub Actions
git add backend/
git commit -m "Deploy backend"
git push origin main
```

### 3. Deploy Infrastructure (Lambda + API Gateway)
```bash
cd infrastructure
terraform plan
terraform apply
```

### 4. Create AWS Amplify Manually
1. Go to AWS Amplify Console
2. Create new app from GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://leonidas-api.datanooblol.com`
5. Set custom domain: `leonidas.datanooblol.com`

### Notes
- Frontend auto-deploys from GitHub pushes
- Backend auto-deploys via GitHub Actions
- Infrastructure changes require manual terraform apply
