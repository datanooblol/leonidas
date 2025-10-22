output "users_table_name" {
  description = "Name of the users DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "ARN of the users DynamoDB table"
  value       = aws_dynamodb_table.users.arn
}

output "projects_table_name" {
  description = "Name of the projects DynamoDB table"
  value       = aws_dynamodb_table.projects.name
}

output "projects_table_arn" {
  description = "ARN of the projects DynamoDB table"
  value       = aws_dynamodb_table.projects.arn
}

output "sessions_table_name" {
  description = "Name of the sessions DynamoDB table"
  value       = aws_dynamodb_table.sessions.name
}

output "sessions_table_arn" {
  description = "ARN of the sessions DynamoDB table"
  value       = aws_dynamodb_table.sessions.arn
}

output "messages_table_name" {
  description = "Name of the messages DynamoDB table"
  value       = aws_dynamodb_table.messages.name
}

output "messages_table_arn" {
  description = "ARN of the messages DynamoDB table"
  value       = aws_dynamodb_table.messages.arn
}

output "files_table_name" {
  description = "Name of the files DynamoDB table"
  value       = aws_dynamodb_table.files.name
}

output "files_table_arn" {
  description = "ARN of the files DynamoDB table"
  value       = aws_dynamodb_table.files.arn
}