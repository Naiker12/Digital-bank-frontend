variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
  default     = "digital-bank-frontend-static"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "Dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "Digital Bank"
}
