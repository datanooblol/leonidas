# Amplify App
resource "aws_amplify_app" "frontend" {
  name       = "${var.project_name}-frontend"
  repository = var.github_repository

  access_token = var.github_token

  build_spec = file("${path.module}/../amplify.yml")

  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"
    VITE_API_URL             = "https://leonidas-api.${var.domain_name}"
  }

  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  tags = {
    Name        = "Frontend App"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Main branch
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"

  environment_variables = {
    NODE_ENV = "production"
  }
}

# Development branch (optional)
resource "aws_amplify_branch" "dev" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "dev"

  environment_variables = {
    NODE_ENV = "development"
  }
}

# Amplify custom domain
resource "aws_amplify_domain_association" "main" {
  app_id      = aws_amplify_app.frontend.id
  domain_name = var.domain_name

  # Primary subdomain (non-www)
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "leonidas"
  }

  # WWW subdomain for corporate networks
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www-leonidas"
  }

  depends_on = [aws_acm_certificate_validation.main]
}