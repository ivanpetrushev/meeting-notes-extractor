# S3 bucket: input audio/video files
resource "aws_s3_bucket" "input" {
  bucket = "${var.service}-input-${random_string.suffix.result}-${terraform.workspace}"
}

resource "aws_s3_bucket_notification" "input" {
  bucket = aws_s3_bucket.input.id
  eventbridge = true
}

# S3 bucket: transcripts
resource "aws_s3_bucket" "transcripts" {
  bucket = "${var.service}-transcripts-${random_string.suffix.result}-${terraform.workspace}"
}

resource "aws_s3_bucket_notification" "transcripts" {
  bucket = aws_s3_bucket.transcripts.id
  eventbridge = true
}

# S3 bucket: output
resource "aws_s3_bucket" "output" {
  bucket = "${var.service}-output-${random_string.suffix.result}-${terraform.workspace}"
}

resource "aws_s3_bucket_notification" "output" {
  bucket = aws_s3_bucket.output.id
  eventbridge = true
}

# Outputs
output "s3_bucket_input" {
  value = aws_s3_bucket.input.id
}

output "s3_bucket_transcripts" {
  value = aws_s3_bucket.transcripts.id
}

output "s3_bucket_output" {
  value = aws_s3_bucket.output.id
}