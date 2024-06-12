resource "aws_lambda_function" "start_transcribe" {
  function_name = "${var.service}-start-transcribe-${terraform.workspace}"
  s3_bucket = aws_s3_bucket.lambda_bundle.id
  s3_key = aws_s3_object.lambda_bundle.key
  role = aws_iam_role.iam_for_lambda.arn
  handler = "handlers/transcribe.start"
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
      S3_BUCKET_INPUT = aws_s3_bucket.input.bucket
      S3_BUCKET_TRANSCRIPTS = aws_s3_bucket.transcripts.bucket
      S3_BUCKET_OUTPUT = aws_s3_bucket.output.bucket
    }
  }
}

resource "aws_lambda_permission" "start_transcribe" {
  statement_id = "AllowExecutionFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.start_transcribe.function_name
  principal = "events.amazonaws.com"
  source_arn = aws_cloudwatch_event_rule.input_uploaded.arn
}

# trigger: S3 upload event on input bucket

resource "aws_cloudwatch_event_rule" "input_uploaded" {
  name = "input_uploaded-${terraform.workspace}"
  description = "Start transcribe job when input file is uploaded"
  event_pattern = jsonencode({
    source = ["aws.s3"],
    detail-type = ["Object Created"],
    detail = {
      bucket = {
        name = [aws_s3_bucket.input.bucket]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "input_uploaded" {
  rule = aws_cloudwatch_event_rule.input_uploaded.name
  arn = aws_lambda_function.start_transcribe.arn
  # role_arn = aws_iam_role.execute_lambda.arn
}