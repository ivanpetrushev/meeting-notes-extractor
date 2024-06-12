terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source = "hashicorp/random"
      version = "3.6.2"
    }
  }
}

provider "aws" {
  # region = "eu-west-1"
  default_tags {
    tags = {
      project = "${var.service}"
      workspace = terraform.workspace
    }
  }
}

terraform {
  backend "s3" {
    bucket = "533267426035-terraform-state-mn"
    key    = "mn/terraform.tfstate"
    region = "eu-central-1"
    dynamodb_table = "mn-terraform-state-lock"
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

// get default VPC
data "aws_vpc" "default" {
  default = true
}
// get default subnets
data "aws_subnets" "default" {
  filter {
    name = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}
// get default security group
data "aws_security_group" "default" {
  vpc_id = data.aws_vpc.default.id
  filter {
    name = "group-name"
    values = ["default"]
  }
}

// some resources must have globally unique resource names - use random suffix
resource "random_string" "suffix" {
  length           = 5
  special          = false
  upper = false
  numeric = false
}