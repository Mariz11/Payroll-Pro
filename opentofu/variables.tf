variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "project_number" {
  description = "The GCP project number"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "app_engine_location" {
  description = "App Engine location"
  type        = string
}

variable "github_owner" {
  description = "GitHub repository owner/organization"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

# App configuration variables
variable "port" {
  description = "Application port"
  type        = string
  default     = "3015"
}

variable "api_title" {
  description = "API title"
  type        = string
}

variable "api_description" {
  description = "API description"
  type        = string
}

variable "api_version" {
  description = "API version"
  type        = string
}

variable "service_name" {
  description = "ML service name"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_connection_limit" {
  description = "Database connection limit"
  type        = string
}

variable "db_socket_path" {
  description = "Database socket path"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, preprod, prod)"
  type        = string
}

variable "tag_pattern" {
  description = "Tag pattern to trigger the deployment (e.g., mlp-v*.*.*)"
  type        = string
}

variable "cloudbuild_filename" {
  description = "Cloud Build configuration filename"
  type        = string
}

variable "database_tier" {
  description = "The machine type to use for the database instance"
  type        = string
}

variable "database_availability_type" {
  description = "Database availability type"
  type        = string
}

variable "trigger_disabled" {
  description = "Trigger disabled"
  type        = string
}

variable "base_path" {
  description = "Base path for the application"
  type        = string
}

# Database configuration
variable "db_client" {
  description = "Database client"
  type        = string
}

variable "db_port" {
  description = "Database port"
  type        = string
  default     = "5432"
}

variable "db_host" {
  description = "Database host"
  type        = string
}

variable "db_user_name" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
}

# Auth and JWT configuration
variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
}

variable "jwt_secret_key" {
  description = "JWT secret key"
  type        = string
}

variable "uni_string" {
  description = "Universal string for authentication"
  type        = string
}

variable "iat" {
  description = "JWT issued at time"
  type        = string
}

variable "next_public_jwt" {
  description = "Public JWT configuration"
  type        = string
}

# API Credentials
variable "ml_anti_tampering_secret" {
  description = "ML anti-tampering secret"
  type        = string
}

variable "ml_payroll_api_key" {
  description = "ML Payroll API key"
  type        = string
}

variable "ml_payroll_secret_key" {
  description = "ML Payroll secret key"
  type        = string
}

# SMS Configuration
variable "ml_sms_username" {
  description = "ML SMS username"
  type        = string
}

variable "ml_sms_password" {
  description = "ML SMS password"
  type        = string
}

variable "ml_sms_sender" {
  description = "ML SMS sender"
  type        = string
}

variable "api_key" {
  description = "API key"
  type        = string
}

variable "secret_key" {
  description = "Secret key"
  type        = string
}

variable "next_public_autolock_timeout" {
  description = "Public autolock timeout"
  type        = string
}

# Batch Upload Configuration
variable "ml_batch_upload_api_key" {
  description = "ML Batch Upload API key"
  type        = string
}

variable "ml_batch_upload_secret_key" {
  description = "ML Batch Upload secret key"
  type        = string
}

variable "ml_batch_upload_client_id" {
  description = "ML Batch Upload client ID"
  type        = string
}

variable "ml_batch_upload_username" {
  description = "ML Batch Upload username"
  type        = string
}

# Loan Schedule Keys
variable "ml_loan_sched_pub_key" {
  description = "ML Loan Schedule public key"
  type        = string
}

variable "ml_loan_sched_priv_key" {
  description = "ML Loan Schedule private key"
  type        = string
}

# ReCAPTCHA Configuration
variable "next_public_recaptcha_site_key" {
  description = "ReCAPTCHA site key"
  type        = string
}

variable "next_public_recaptcha_secret_key" {
  description = "ReCAPTCHA secret key"
  type        = string
}

# API Domains
variable "ml_batch_upload_domain" {
  description = "ML Batch Upload domain"
  type        = string
}

variable "ml_sms_api_domain" {
  description = "ML SMS API domain"
  type        = string
}

variable "ml_loans_domain" {
  description = "ML Loans domain"
  type        = string
}

variable "ml_kpx_domain" {
  description = "ML KPX domain"
  type        = string
}

# Email Configuration
variable "email_sender" {
  description = "Email sender address"
  type        = string
}

variable "smtp_host" {
  description = "SMTP host"
  type        = string
}

variable "smtp_service" {
  description = "SMTP service"
  type        = string
}

variable "smtp_port" {
  description = "SMTP port"
  type        = string
}

variable "smtp_user" {
  description = "SMTP username"
  type        = string
}

variable "smtp_password" {
  description = "SMTP password"
  type        = string
}

# File Upload Configuration
variable "next_public_ml_file_upload_url" {
  description = "Public ML file upload URL"
  type        = string
}

# Database Pool Configuration
variable "db_pool_max" {
  description = "Maximum database pool connections"
  type        = string
}

variable "db_pool_min" {
  description = "Minimum database pool connections"
  type        = string
}

variable "db_pool_acquire" {
  description = "Database pool acquire timeout"
  type        = string
}

variable "db_pool_idle" {
  description = "Database pool idle timeout"
  type        = string
}

# Logs Database Configuration
variable "log_db_name" {
  description = "Logs database name"
  type        = string
}

variable "log_db_user_name" {
  description = "Logs database username"
  type        = string
}

variable "log_db_password" {
  description = "Logs database password"
  type        = string
}

variable "log_db_host" {
  description = "Logs database host"
  type        = string
}

variable "log_db_port" {
  description = "Logs database port"
  type        = string
}

variable "log_db_client" {
  description = "Logs database client"
  type        = string
}

variable "log_db_socket_path" {
  description = "Logs database socket path"
  type        = string
}

variable "ml_auth_service_api_domain" {
  description = "ML Auth Service API domain"
  type        = string
}

variable "ml_payroll_api_domain" {
  description = "ML Payroll API domain"
  type        = string
}

variable "ml_ckyc_api_domain" {
  description = "ML CKYC API domain"
  type        = string
}

variable "min_idle_instances" {
  description = "Minimum idle instances"
  type        = string
}

variable "max_concurrent_requests" {
  description = "Maximum concurrent requests"
  type        = string
}

variable "instance_class" {
  description = "Instance class"
  type        = string
}

variable "ml_notification_api_domain" {
  description = "ML Notification API domain"
  type        = string
}

# GCP Cloud Storage Configuration
variable "gcp_cloud_storage_bucket_name" {
  description = "GCP Cloud Storage bucket name"
  type        = string
}

variable "gcp_cloud_storage_bucket_directory" {
  description = "GCP Cloud Storage bucket directory"
  type        = string
}

variable "gcp_cloud_service_account_client_email" {
  description = "GCP Cloud Service Account client email"
  type        = string
}

variable "gcp_cloud_service_account_private_key" {
  description = "GCP Cloud Service Account private key"
  type        = string
}

variable "gcp_cloud_function_url_generate_failed_registration_csv" {
  description = "GCP Cloud Service Cloud Function URL"
  type        = string
}

# Firebase Configuration
variable "next_public_firebase_api_key" {
  description = "Firebase API key"
  type        = string
}

variable "next_public_firebase_auth_domain" {
  description = "Firebase auth domain"
  type        = string
}

variable "next_public_firebase_project_id" {
  description = "Firebase project ID"
  type        = string
}

variable "next_public_firebase_storage_bucket" {
  description = "Firebase storage bucket"
  type        = string
}

variable "next_public_firebase_messaging_sending_id" {
  description = "Firebase messaging sender ID"
  type        = string
}

variable "next_public_firebase_app_id" {
  description = "Firebase app ID"
  type        = string
}

variable "next_public_firebase_database_id" {
  description = "Firebase database ID"
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase project ID"
  type        = string
}

variable "firebase_database_id" {
  description = "Firebase database ID"
  type        = string
}

variable "firebase_collection_bulk_employee_responses" {
  description = "Firebase collection for bulk employee responses"
  type        = string
}
