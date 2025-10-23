# Alternative: S3 + CloudFront (cheaper than Amplify)
# Uncomment this if you want to replace Amplify

# resource "aws_s3_bucket" "frontend" {
#   bucket = "leonidas-frontend-${random_id.bucket_suffix.hex}"
# }

# resource "random_id" "bucket_suffix" {
#   byte_length = 4
# }

# resource "aws_s3_bucket_website_configuration" "frontend" {
#   bucket = aws_s3_bucket.frontend.id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "index.html"
#   }
# }

# resource "aws_cloudfront_distribution" "frontend" {
#   origin {
#     domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
#     origin_id   = "S3-${aws_s3_bucket.frontend.id}"
#   }

#   enabled             = true
#   default_root_object = "index.html"

#   aliases = ["leonidas.${var.domain_name}", "www.leonidas.${var.domain_name}"]

#   default_cache_behavior {
#     allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods         = ["GET", "HEAD"]
#     target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
#     compress               = true
#     viewer_protocol_policy = "redirect-to-https"

#     forwarded_values {
#       query_string = false
#       cookies {
#         forward = "none"
#       }
#     }
#   }

#   viewer_certificate {
#     acm_certificate_arn = aws_acm_certificate_validation.main.certificate_arn
#     ssl_support_method  = "sni-only"
#   }

#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#     }
#   }
# }