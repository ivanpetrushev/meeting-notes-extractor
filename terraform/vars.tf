variable "service" {
  type = string
}
variable "backend_bundle_version" {
  type = string
  default = "latest"
}
variable "bedrock_region" {
  type = string
}
variable "bedrock_model_id" {
  type = string
}