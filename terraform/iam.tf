resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.service}-${terraform.workspace}-iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  inline_policy {
    name = "WriteLogs"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Effect   = "Allow"
          Resource = "arn:aws:logs:*:*:*"
        },
      ]
    })
  }

  inline_policy {
    name = "XRay"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "xray:PutTraceSegments",
            "xray:PutTelemetryRecords",
            "xray:GetSamplingRules",
            "xray:GetSamplingTargets",
            "xray:GetSamplingStatisticSummaries"
          ]
          Effect   = "Allow"
          Resource = "*"
        }
      ]
    })
  }

  inline_policy {
    name = "BucketReadWriteAccess"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "s3:PutObject",
            "s3:PutObjectAcl",
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:ListBucket"
          ]
          Effect   = "Allow"
          Resource = [
            "arn:aws:s3:::${aws_s3_bucket.input.id}",
            "arn:aws:s3:::${aws_s3_bucket.input.id}/*",
            "arn:aws:s3:::${aws_s3_bucket.transcripts.id}",
            "arn:aws:s3:::${aws_s3_bucket.transcripts.id}/*",
            "arn:aws:s3:::${aws_s3_bucket.output.id}",
            "arn:aws:s3:::${aws_s3_bucket.output.id}/*",
          ]
        }
      ]
    })
  }

  inline_policy {
    name = "TranscribeJobs"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "transcribe:StartTranscriptionJob",
          ]
          Effect   = "Allow"
          Resource = "*"
        }
      ]
    })
  }

  inline_policy {
    name = "InvokeBedrock"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "bedrock:InvokeModel"
          ]
          Effect   = "Allow"
          Resource = "*"
        }
      ]
    })
  }

}
