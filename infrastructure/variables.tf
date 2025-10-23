variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "table_prefix" {
  description = "Prefix for DynamoDB table names"
  type        = string
  default     = "leonidas_dev_"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "leonidas"
}

variable "domain_name" {
  description = "Your existing domain name in Route53"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token for Amplify"
  type        = string
  sensitive   = true
}

variable "github_repository" {
  description = "GitHub repository URL"
  type        = string
}
