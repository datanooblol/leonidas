# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api"
  description = "API for ${var.project_name}"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "Main API Gateway"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API Gateway resource (catch-all)
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway method (ANY)
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway integration with Lambda - Commented out until Lambda is created
# resource "aws_api_gateway_integration" "lambda" {
#   rest_api_id = aws_api_gateway_rest_api.main.id
#   resource_id = aws_api_gateway_method.proxy.resource_id
#   http_method = aws_api_gateway_method.proxy.http_method
#
#   integration_http_method = "POST"
#   type                   = "AWS_PROXY"
#   uri                    = aws_lambda_function.api.invoke_arn
# }
#
# # Lambda permission for API Gateway
# resource "aws_lambda_permission" "api_gw" {
#   statement_id  = "AllowExecutionFromAPIGateway"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.api.function_name
#   principal     = "apigateway.amazonaws.com"
#   source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
# }

# API Gateway deployment - Commented out until Lambda integration is added
# resource "aws_api_gateway_deployment" "main" {
#   depends_on = [
#     aws_api_gateway_integration.lambda,
#   ]
#
#   rest_api_id = aws_api_gateway_rest_api.main.id
#
#   lifecycle {
#     create_before_destroy = true
#   }
# }
#
# # API Gateway stage
# resource "aws_api_gateway_stage" "main" {
#   deployment_id = aws_api_gateway_deployment.main.id
#   rest_api_id   = aws_api_gateway_rest_api.main.id
#   stage_name    = var.environment
#
#   tags = {
#     Name        = "API Stage"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }

# API Gateway custom domain (non-www)
resource "aws_api_gateway_domain_name" "api" {
  domain_name     = "leonidas-api.${var.domain_name}"
  certificate_arn = aws_acm_certificate_validation.main.certificate_arn

  tags = {
    Name        = "API Custom Domain"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API Gateway base path mapping (non-www) - Commented out until stage is created
# resource "aws_api_gateway_base_path_mapping" "api" {
#   api_id      = aws_api_gateway_rest_api.main.id
#   stage_name  = aws_api_gateway_stage.main.stage_name
#   domain_name = aws_api_gateway_domain_name.api.domain_name
# }

# Route53 record for API (non-www)
resource "aws_route53_record" "api" {
  name    = aws_api_gateway_domain_name.api.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.main.zone_id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.api.cloudfront_domain_name
    zone_id               = aws_api_gateway_domain_name.api.cloudfront_zone_id
  }
}