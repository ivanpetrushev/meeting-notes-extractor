resource "aws_lambda_function" "google_auth" {
  function_name = "${var.subservice}-google-drive-${terraform.workspace}"
  s3_bucket = data.terraform_remote_state.main.outputs.s3_bucket_lambda_bundle
  s3_key = aws_s3_object.lambda_bundle.key
  role = aws_iam_role.iam_for_lambda.arn
  handler = "handlers/google.handler"
  runtime = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_bundle.output_base64sha256
  timeout = 3 * 60
  memory_size = 256
  // 2GB of /tmp storage - TODO: do we need this? Files fetched from Google Drive are streamed to S3, not stored on disk
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

output "google_redirect_url" {
  value = "${aws_lambda_function_url.google_auth.function_url}callback"
}

output "initial_url" {
  value = aws_lambda_function_url.google_auth.function_url
}

resource "aws_cloudwatch_event_rule" "google_auth" {
    name = "${var.subservice}-cron-${terraform.workspace}"
    description = "Schedule for running cron lambdas for Google Drive"
    # run every 10 min (TODO: make this configurable)
    schedule_expression = "cron(*/10 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "google_auth" {
    rule = aws_cloudwatch_event_rule.google_auth.name
    target_id = "${var.subservice}-cron-${terraform.workspace}"
    arn = aws_lambda_function.google_auth.arn
}


resource "aws_lambda_permission" "google_auth" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.google_auth.function_name
    principal = "events.amazonaws.com"
}