resource "aws_dynamodb_table" "main" {
  name = "${var.subservice}-${terraform.workspace}"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "sk2"
    type = "S"
  }

  attribute {
    name = "sk3"
    type = "S"
  }

  attribute {
    name = "model"
    type = "S"
  }

  # TODO: refine GSIs, we probably don't need that many
  global_secondary_index {
    name               = "inverted"
    hash_key           = "sk"
    range_key          = "pk"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "PK_SK2"
    hash_key           = "pk"
    range_key          = "sk2"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "PK_SK3"
    hash_key           = "pk"
    range_key          = "sk3"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "MODEL_PK"
    hash_key           = "model"
    range_key          = "pk"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "SK2_PK"
    hash_key           = "sk2"
    range_key          = "pk"
    projection_type    = "ALL"
  }

}
