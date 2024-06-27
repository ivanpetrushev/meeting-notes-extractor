resource "aws_s3_bucket" "lambda_bundle" {
  bucket = "${var.service}-lambda-bundle-${random_string.suffix.result}-${terraform.workspace}"
}
data "archive_file" "lambda_bundle" {
  type = "zip"

  source_dir  = "/work/src/"
  output_path = "/tmp/build/lambdas.zip"
}

resource "aws_s3_object" "lambda_bundle" {
  bucket = aws_s3_bucket.lambda_bundle.id

  key    = "${var.backend_bundle_version}/lambdas-bundle.zip"
  source = data.archive_file.lambda_bundle.output_path

  etag = filemd5(data.archive_file.lambda_bundle.output_path)
}

output "s3_bucket_lambda_bundle" {
  value = aws_s3_bucket.lambda_bundle.bucket
}