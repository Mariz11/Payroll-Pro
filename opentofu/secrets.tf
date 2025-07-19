# Create secrets without versions
resource "google_secret_manager_secret" "secrets" {
  # !!! SHOULD BE IN SYNC WITH THE SECRETS IN SECRET MANAGER !!!
  for_each = {
    # Database passwords
    "DB_PASSWORD"                         = "Database password"
    "LOG_DB_PASSWORD"                     = "Logs database password"

    # Auth and JWT configuration
    "NEXTAUTH_SECRET"                     = "NextAuth secret"
    "JWT_SECRET_KEY"                      = "JWT secret key"

    # API Credentials
    "API_KEY"                             = "API key for authentication"
    "SECRET_KEY"                          = "General secret key"
    "ML_ANTI_TAMPERING_SECRET"            = "ML anti-tampering secret"
    "ML_PAYROLL_API_KEY"                  = "ML Payroll API key"
    "ML_PAYROLL_SECRET_KEY"               = "ML Payroll secret key"
    "ML_BATCH_UPLOAD_API_KEY"             = "ML Batch Upload API key"
    "ML_BATCH_UPLOAD_SECRET_KEY"          = "ML Batch Upload secret key"

    # SMS Configuration
    "ML_SMS_PASSWORD"                     = "ML SMS password"

    # Loan Schedule Keys
    "ML_LOAN_SCHED_PUB_KEY"               = "ML Loan Schedule public key"
    "ML_LOAN_SCHED_PRIV_KEY"              = "ML Loan Schedule private key"

    # ReCAPTCHA Configuration
    "NEXT_PUBLIC_RECAPTCHA_SECRET_KEY"    = "ReCAPTCHA secret key"

    # Email Password
    "SMTP_PASSWORD"                       = "SMTP password for email"

    # GCP Service Account
    "GCP_CLOUD_SERVICE_ACCOUNT_PRIVATE_KEY" = "GCP Cloud Service Account private key"

    # Firebase API Key
    "NEXT_PUBLIC_FIREBASE_API_KEY"        = "Firebase API key"
  }

  secret_id = each.key
  project   = var.project_id

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

# Grant Secret Manager accessor role to App Engine service account
resource "google_project_iam_member" "secretmanager_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"

  depends_on = [google_app_engine_application.app]
}
