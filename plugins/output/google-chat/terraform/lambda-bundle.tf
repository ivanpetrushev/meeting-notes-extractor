# resource "aws_s3_bucket" "lambda_bundle" {
#   bucket = "${var.subservice}-lambda-bundle-${random_string.suffix.result}-${terraform.workspace}"
# }

data "archive_file" "lambda_bundle" {
  type = "zip"

  source_dir  = "/work/src/"
  output_path = "/tmp/build/lambdas.zip"
}

resource "aws_s3_object" "lambda_bundle" {
  bucket = data.terraform_remote_state.main.outputs.s3_bucket_lambda_bundle

  key    = "${var.backend_bundle_version}/${var.subservice}/lambdas-bundle.zip"
  source = data.archive_file.lambda_bundle.output_path

  etag = filemd5(data.archive_file.lambda_bundle.output_path)
}
