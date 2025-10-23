# Amplify resources commented out - app manually created
# Uncomment and run terraform apply when ready to manage via Terraform

# # IAM role for Amplify
# resource "aws_iam_role" "amplify_role" {
#   name = "${var.project_name}-amplify-role"
# 
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = "sts:AssumeRole"
#         Effect = "Allow"
#         Principal = {
#           Service = [
#             "amplify.amazonaws.com",
#             "codebuild.amazonaws.com"
#           ]
#         }
#       }
#     ]
#   })
# }
# 
# # Attach basic Amplify policies
# resource "aws_iam_role_policy_attachment" "amplify_backend_deploy" {
#   policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
#   role       = aws_iam_role.amplify_role.name
# }
# 
# resource "aws_iam_role_policy_attachment" "amplify_service_role" {
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
#   role       = aws_iam_role.amplify_role.name
# }
# 
# # Amplify App
# resource "aws_amplify_app" "frontend" {
#   name       = "${var.project_name}-frontend"
#   repository = var.github_repository
# 
#   access_token = var.github_token
# 
#   build_spec = file("${path.module}/../amplify.yml")
# 
#   environment_variables = {
#     AMPLIFY_MONOREPO_APP_ROOT = "frontend"
#     NEXT_PUBLIC_API_URL      = "https://leonidas-api.${var.domain_name}"
#   }
# 
#   custom_rule {
#     source = "/<*>"
#     status = "404"
#     target = "/index.html"
#   }
# 
#   tags = {
#     Name        = "Frontend App"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }
# 
# # Main branch
# resource "aws_amplify_branch" "main" {
#   app_id      = aws_amplify_app.frontend.id
#   branch_name = "main"
# 
#   environment_variables = {
#     NODE_ENV = "production"
#   }
# }
# 
# # Development branch (optional)
# resource "aws_amplify_branch" "dev" {
#   app_id      = aws_amplify_app.frontend.id
#   branch_name = "dev"
# 
#   environment_variables = {
#     NODE_ENV = "development"
#   }
# }
# 
# # Amplify custom domain
# resource "aws_amplify_domain_association" "main" {
#   app_id      = aws_amplify_app.frontend.id
#   domain_name = var.domain_name
# 
#   # Primary subdomain (non-www)
#   sub_domain {
#     branch_name = aws_amplify_branch.main.branch_name
#     prefix      = "leonidas"
#   }
# 
#   # WWW subdomain for corporate networks
#   sub_domain {
#     branch_name = aws_amplify_branch.main.branch_name
#     prefix      = "www-leonidas"
#   }
# 
#   depends_on = [aws_acm_certificate_validation.main]
# }