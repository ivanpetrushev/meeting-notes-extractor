resource "aws_lambda_function" "google_auth" {
  function_name = "${var.subservice}-google-auth-${terraform.workspace}"
  s3_bucket = data.terraform_remote_state.main.outputs.s3_bucket_lambda_bundle
  s3_key = aws_s3_object.lambda_bundle.key
  role = aws_iam_role.iam_for_lambda.arn
  handler = "handlers/google.auth"
  runtime = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_bundle.output_base64sha256
  timeout = 3 * 60
  memory_size = 256
  // 2GB of /tmp storage
  ephemeral_storage {
    size = 2 * 1024
  }
  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      REGION = data.aws_region.current.name
      STAGE = "${terraform.workspace}"
      S3_BUCKET_INPUT = data.terraform_remote_state.main.outputs.s3_bucket_input
      DDB_TABLE = aws_dynamodb_table.main.name
    }
  }
}

resource "aws_lambda_function_url" "google_auth" {
  function_name = aws_lambda_function.google_auth.function_name
  authorization_type = "NONE"
}

output "google_auth_url" {
  value = aws_lambda_function_url.google_auth.function_url
}

# resource "aws_lambda_permission" "google_auth" {
#   statement_id = "AllowExecutionFromCloudWatch"
#   action = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.google_auth.function_name
#   principal = "events.amazonaws.com"
#   source_arn = aws_cloudwatch_event_rule.google_auth.arn
# }

# # trigger: S3 upload event on input bucket

# resource "aws_cloudwatch_event_rule" "google_auth" {
#   name = "google_auth-${terraform.workspace}"
#   description = "Announce output to Google Chat"
#   event_pattern = jsonencode({
#     source = ["aws.s3"],
#     detail-type = ["Object Created"],
#     detail = {
#       bucket = {
#         name = [data.terraform_remote_state.main.outputs.s3_bucket_output]
#       }
#     }
#   })
# }

# resource "aws_cloudwatch_event_target" "google_auth" {
#   rule = aws_cloudwatch_event_rule.google_auth.name
#   arn = aws_lambda_function.google_auth.arn
#   # role_arn = aws_iam_role.execute_lambda.arn
# }