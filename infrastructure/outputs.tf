# Database outputs
output "users_table_name" {
  description = "Name of the users DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "projects_table_name" {
  description = "Name of the projects DynamoDB table"
  value       = aws_dynamodb_table.projects.name
}

output "sessions_table_name" {
  description = "Name of the sessions DynamoDB table"
  value       = aws_dynamodb_table.sessions.name
}

output "messages_table_name" {
  description = "Name of the messages DynamoDB table"
  value       = aws_dynamodb_table.messages.name
}

output "files_table_name" {
  description = "Name of the files DynamoDB table"
  value       = aws_dynamodb_table.files.name
}

# Storage outputs
output "s3_bucket_name" {
  description = "Name of the S3 uploads bucket"
  value       = aws_s3_bucket.uploads.bucket
}

# Container outputs
output "ecr_repository_url" {
  description = "ECR repository URL for backend container"
  value       = aws_ecr_repository.backend.repository_url
}

# output "lambda_function_name" {
#   description = "Lambda function name"
#   value       = aws_lambda_function.api.function_name
# }

# API outputs
output "api_gateway_url" {
  description = "API Gateway custom domain URL"
  value       = "https://leonidas-api.${var.domain_name}"
}

output "api_gateway_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.main.id
}

# Frontend outputs
output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.frontend.id
}

output "amplify_app_url" {
  description = "Amplify App custom domain URL"
  value       = "https://leonidas.${var.domain_name}"
}

output "amplify_app_url_www" {
  description = "Amplify App custom domain URL (WWW)"
  value       = "https://www.leonidas.${var.domain_name}"
}

# DNS outputs
output "certificate_arn" {
  description = "ACM Certificate ARN"
  value       = aws_acm_certificate.main.arn
}