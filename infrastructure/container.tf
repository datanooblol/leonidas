# ECR repository for backend container
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "Backend Container Repository"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "Lambda Execution Role"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.projects.arn,
          aws_dynamodb_table.sessions.arn,
          aws_dynamodb_table.messages.arn,
          aws_dynamodb_table.files.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.projects.arn}/index/*",
          "${aws_dynamodb_table.sessions.arn}/index/*",
          "${aws_dynamodb_table.messages.arn}/index/*",
          "${aws_dynamodb_table.files.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.uploads.arn}/*"
      }
    ]
  })
}

# Lambda function (container-based)
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  role         = aws_iam_role.lambda_role.arn
  
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.backend.repository_url}:latest"
  
  timeout     = 300  # 5 minutes
  memory_size = 512

  environment {
    variables = {
      JWT_SECRET_KEY        = "this-is-spar-tan"
      APP_AWS_REGION        = var.aws_region
      DYNAMODB_TABLE_PREFIX = var.table_prefix
      S3_BUCKET            = aws_s3_bucket.uploads.bucket
      FILE_BUCKET          = aws_s3_bucket.uploads.bucket
      BEDROCK_REGION       = "us-west-2"
    }
  }

  tags = {
    Name        = "Backend API Function"
    Environment = var.environment
    Project     = var.project_name
  }

  lifecycle {
    ignore_changes = [image_uri]
  }
}