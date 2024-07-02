resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.subservice}-${terraform.workspace}-iam_for_lambda"

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
    name = "ReadWriteDynamodb"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = ["dynamodb:*"]
          Effect = "Allow"
          Resource = [
            "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.main.name}/index/*",
            "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.main.name}",
            # "arn:aws:dynamodb:*:*:table/*/stream/*",
            # "arn:aws:dynamodb::*:global-table/*",
            # "arn:aws:dynamodb:*:*:table/*/backup/*",
          ]
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
            # "s3:GetObject",
            # "s3:DeleteObject",
            # "s3:ListBucket"
          ]
          Effect   = "Allow"
          Resource = [
            "arn:aws:s3:::${data.terraform_remote_state.main.outputs.s3_bucket_input}",
            "arn:aws:s3:::${data.terraform_remote_state.main.outputs.s3_bucket_input}/*",
          ]
        }
      ]
    })
  }

}
