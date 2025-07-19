# Create Cloud Build service account
resource "google_service_account" "cloudbuild_service_account" {
  account_id   = "cloudbuild-sa"
  display_name = "cloudbuild-sa"
  description  = "Cloud build service account"
}

# Cloud Build trigger for deployment
resource "google_cloudbuild_trigger" "app" {
  name        = "initial-trigger"
  description = "Initial trigger configuration. Duplicate this trigger and modify accordingly."
  disabled    = var.trigger_disabled

  github {
    owner = var.github_owner
    name  = var.github_repo

    push {
      tag = var.tag_pattern
    }
  }

  filename = var.cloudbuild_filename

  # !!! SHOULD BE IN SYNC WITH the cloudbuild.yaml file substitutions section !!!
  substitutions = {
    _BASE_PATH                 = var.base_path

    # Database configuration
    _DB_NAME                   = var.db_name
    _DB_USER_NAME             = var.db_user_name
    _DB_PASSWORD              = var.db_password
    _DB_HOST                  = var.db_host
    _DB_PORT                  = var.db_port
    _DB_CLIENT                = var.db_client
    _DB_SOCKET_PATH           = var.db_socket_path

    _SERVICE_NAME             = var.service_name

    # Auth and JWT configuration
    _NEXTAUTH_SECRET          = var.nextauth_secret
    _JWT_SECRET_KEY           = var.jwt_secret_key
    _UNI_STRING              = var.uni_string
    _IAT                     = var.iat
    _NEXT_PUBLIC_JWT         = var.next_public_jwt

    # API Credentials
    _ML_ANTI_TAMPERING_SECRET = var.ml_anti_tampering_secret
    _ML_PAYROLL_API_KEY      = var.ml_payroll_api_key
    _ML_PAYROLL_SECRET_KEY   = var.ml_payroll_secret_key
    _ML_BATCH_UPLOAD_API_KEY = var.ml_batch_upload_api_key
    _ML_BATCH_UPLOAD_SECRET_KEY = var.ml_batch_upload_secret_key
    _ML_BATCH_UPLOAD_CLIENT_ID = var.ml_batch_upload_client_id
    _ML_BATCH_UPLOAD_USERNAME = var.ml_batch_upload_username

    # SMS Configuration
    _ML_SMS_USERNAME         = var.ml_sms_username
    _ML_SMS_PASSWORD        = var.ml_sms_password
    _ML_SMS_SENDER         = var.ml_sms_sender

    _API_KEY               = var.api_key
    _SECRET_KEY           = var.secret_key

    _NEXT_PUBLIC_AUTOLOCK_TIMEOUT = var.next_public_autolock_timeout

    # Loan Schedule Keys
    _ML_LOAN_SCHED_PUB_KEY  = var.ml_loan_sched_pub_key
    _ML_LOAN_SCHED_PRIV_KEY = var.ml_loan_sched_priv_key

    # ReCAPTCHA Configuration
    _NEXT_PUBLIC_RECAPTCHA_SITE_KEY = var.next_public_recaptcha_site_key
    _NEXT_PUBLIC_RECAPTCHA_SECRET_KEY = var.next_public_recaptcha_secret_key

    # API Domains
    _ML_AUTH_SERVICE_API_DOMAIN = var.ml_auth_service_api_domain
    _ML_PAYROLL_API_DOMAIN    = var.ml_payroll_api_domain
    _ML_CKCYC_API_DOMAIN     = var.ml_ckyc_api_domain
    _ML_BATCH_UPLOAD_DOMAIN  = var.ml_batch_upload_domain
    _ML_SMS_API_DOMAIN      = var.ml_sms_api_domain
    _ML_LOANS_DOMAIN       = var.ml_loans_domain
    _ML_KPX_DOMAIN        = var.ml_kpx_domain
    _ML_NOTIFICATION_API_DOMAIN = var.ml_notification_api_domain

    # Email Configuration
    _EMAIL_SENDER          = var.email_sender
    _SMTP_HOST            = var.smtp_host
    _SMTP_SERVICE         = var.smtp_service
    _SMTP_PORT            = var.smtp_port
    _SMTP_USER            = var.smtp_user
    _SMTP_PASSWORD        = var.smtp_password

    # File Upload URL
    _NEXT_PUBLIC_ML_FILE_UPLOAD_URL = var.next_public_ml_file_upload_url

    # Database Pool Configuration
    _DB_POOL_MAX          = var.db_pool_max
    _DB_POOL_MIN          = var.db_pool_min
    _DB_POOL_ACQUIRE      = var.db_pool_acquire
    _DB_POOL_IDLE         = var.db_pool_idle

    # Logs Database Configuration
    _LOG_DB_NAME          = var.log_db_name
    _LOG_DB_USER_NAME     = var.log_db_user_name
    _LOG_DB_PASSWORD      = var.log_db_password
    _LOG_DB_HOST          = var.log_db_host
    _LOG_DB_PORT          = var.log_db_port
    _LOG_DB_CLIENT        = var.log_db_client
    _LOG_DB_SOCKET_PATH   = var.log_db_socket_path

    # GCP Services
    _GCP_CLOUD_STORAGE_BUCKET_NAME                                = var.gcp_cloud_storage_bucket_name
    _GCP_CLOUD_STORAGE_BUCKET_DIRECTORY                           = var.gcp_cloud_storage_bucket_directory
    _GCP_CLOUD_SERVICE_ACCOUNT_CLIENT_EMAIL                       = var.gcp_cloud_service_account_client_email
    _GCP_CLOUD_SERVICE_ACCOUNT_PRIVATE_KEY                        = var.gcp_cloud_service_account_private_key
    _GCP_CLOUD_FUNCTION_URL_GENERATE_FAILED_REGISTRATION_CSV      = var.gcp_cloud_function_url_generate_failed_registration_csv

    # Firesbase
    _NEXT_PUBLIC_FIREBASE_API_KEY                = var.next_public_firebase_api_key
    _NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN            = var.next_public_firebase_auth_domain
    _NEXT_PUBLIC_FIREBASE_PROJECT_ID             = var.next_public_firebase_project_id
    _NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET         = var.next_public_firebase_storage_bucket
    _NEXT_PUBLIC_FIREBASE_MESSAGING_SENDING_ID   = var.next_public_firebase_messaging_sending_id
    _NEXT_PUBLIC_FIREBASE_APP_ID                 = var.next_public_firebase_app_id
    _NEXT_PUBLIC_FIREBASE_DATABASE_ID            = var.next_public_firebase_database_id
    _FIREBASE_PROJECT_ID                         = var.firebase_project_id
    _FIREBASE_DATABASE_ID                       = var.firebase_database_id
    _FIREBASE_COLLECTION_BULK_EMPLOYEE_RESPONSES = var.firebase_collection_bulk_employee_responses


    # App Engine Configuration
    _MIN_IDLE_INSTANCES = var.min_idle_instances
    _MAX_CONCURRENT_REQUESTS = var.max_concurrent_requests
    _INSTANCE_CLASS = var.instance_class
  }

  service_account = google_service_account.cloudbuild_service_account.id

  depends_on = [google_project_service.required_apis]
}

# IAM - Grant Cloud Build service account App Engine deployer role
resource "google_project_iam_member" "cloudbuild_appengine" {
  project = var.project_id
  role    = "roles/appengine.appAdmin"
  member  = "serviceAccount:${google_service_account.cloudbuild_service_account.email}"

  depends_on = [google_app_engine_application.app]
}

# IAM - Grant Cloud Build service account Log Writer role
resource "google_project_iam_member" "cloudbuild_logwriter" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudbuild_service_account.email}"

  depends_on = [google_service_account.cloudbuild_service_account]
}

# IAM - Grant Cloud Build service account Cloud Build Builder role
resource "google_project_iam_member" "cloudbuild_builder" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.cloudbuild_service_account.email}"

  depends_on = [google_service_account.cloudbuild_service_account]
}

# IAM - Grant Cloud Build service account permission to act as App Engine default service account
resource "google_project_iam_member" "cloudbuild_act_as_appengine" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloudbuild_service_account.email}"

  depends_on = [google_service_account.cloudbuild_service_account]
}

# IAM - Grant Cloud Build service account Secret Manager Secret Accessor role
resource "google_project_iam_member" "cloudbuild_secretmanager_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudbuild_service_account.email}"

  depends_on = [google_service_account.cloudbuild_service_account]
}
