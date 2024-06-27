resource "aws_lambda_function" "announce_output" {
  function_name = "${var.subservice}-announce-output-${terraform.workspace}"
  s3_bucket = data.terraform_remote_state.main.outputs.s3_bucket_lambda_bundle
  s3_key = aws_s3_object.lambda_bundle.key
  role = aws_iam_role.iam_for_lambda.arn
  handler = "handlers/announce.announceOutput"
  runtime = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_bundle.output_base64sha256
  timeout = 15
  memory_size = 256
  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      REGION = data.aws_region.current.name
      STAGE = "${terraform.workspace}"
      S3_BUCKET_OUTPUT = data.terraform_remote_state.main.outputs.s3_bucket_output
    }
  }
}

resource "aws_lambda_permission" "announce_output" {
  statement_id = "AllowExecutionFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.announce_output.function_name
  principal = "events.amazonaws.com"
  source_arn = aws_cloudwatch_event_rule.announce_output.arn
}

# trigger: S3 upload event on input bucket

resource "aws_cloudwatch_event_rule" "announce_output" {
  name = "announce_output-${terraform.workspace}"
  description = "Announce output to Google Chat"
  event_pattern = jsonencode({
    source = ["aws.s3"],
    detail-type = ["Object Created"],
    detail = {
      bucket = {
        name = [data.terraform_remote_state.main.outputs.s3_bucket_output]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "announce_output" {
  rule = aws_cloudwatch_event_rule.announce_output.name
  arn = aws_lambda_function.announce_output.arn
  # role_arn = aws_iam_role.execute_lambda.arn
}