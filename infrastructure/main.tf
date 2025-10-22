terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

# DynamoDB table for users
resource "aws_dynamodb_table" "users" {
  name           = "${var.table_prefix}users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = {
    Name        = "Users Table"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for projects
resource "aws_dynamodb_table" "projects" {
  name           = "${var.table_prefix}projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "project_id"

  attribute {
    name = "project_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIndex"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "Projects Table"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for sessions
resource "aws_dynamodb_table" "sessions" {
  name           = "${var.table_prefix}sessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "session_id"

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "project_id"
    type = "S"
  }

  global_secondary_index {
    name            = "ProjectIndex"
    hash_key        = "project_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "Sessions Table"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for messages
resource "aws_dynamodb_table" "messages" {
  name           = "${var.table_prefix}messages"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "message_id"

  attribute {
    name = "message_id"
    type = "S"
  }

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "SessionIndex"
    hash_key        = "session_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  tags = {
    Name        = "Messages Table"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for files
resource "aws_dynamodb_table" "files" {
  name           = "${var.table_prefix}files"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "file_id"

  attribute {
    name = "file_id"
    type = "S"
  }

  attribute {
    name = "project_id"
    type = "S"
  }

  global_secondary_index {
    name            = "ProjectIndex"
    hash_key        = "project_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "Files Table"
    Environment = var.environment
    Project     = var.project_name
  }
}