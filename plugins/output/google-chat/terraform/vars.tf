variable "service" {
  type = string
}
variable "subservice" {
  type = string
  default = "mnpo-gchat"
}
variable "backend_bundle_version" {
  type = string
  default = "latest"
}
