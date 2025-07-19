environment         = "preprod"
tag_pattern         = "^pp-v*.*.*$"
cloudbuild_filename = "cloudbuild.yaml"
project_id         = "paypro-preprod"
project_number     = "702253282203"
api_title          = "Paypro (Preprod)"
api_description    = "Paypro - Preprod Environment"
db_name            = "ml_payroll_pro"
db_socket_path     = "/cloudsql/paypro-preprod:asia-southeast1:paypro-preprod"
database_tier = "db-n1-standard-1"
database_availability_type = "ZONAL"

# Database configuration
db_client          = "mysql"
db_port            = "3306"
db_host             = "/cloudsql/paypro-preprod:asia-southeast1:paypro-preprod"
db_user_name        = "paypro-preprod-app-user"
db_password        = "!!! UPDATE IN CLOUD BUILD !!!"
# Default values for non-sensitive configurations
next_public_autolock_timeout = "300000"
db_pool_max        = "1000"
db_pool_min        = "0"
db_pool_acquire    = "30000"
db_pool_idle       = "10000"

# API Domains for dev environment
ml_auth_service_api_domain = "https://ml.hilda.mlhuillier.com"
ml_payroll_api_domain     = "https://ml-payroll-preprod.as.r.appspot.com"
ml_ckyc_api_domain      = "https://ml-ckyc-preprod.as.r.appspot.com/api/v1"
ml_batch_upload_domain = "https://lion.mlhuillier.net/MLPayrollLite"
ml_sms_api_domain     = "https://qwesfewq-pp-apigateway.mlhuillier.com"
ml_loans_domain      = "https://xeme.mlhuillier.net"
ml_kpx_domain       = "https://hilda.mlhuillier.com"
ml_notification_api_domain = "https://ml-notification-preprod.as.r.appspot.com"

base_path           = "https://paypro-preprod.as.r.appspot.com"

# Email Configuration for dev
smtp_host           = "10.4.9.90"
smtp_service        = "gmail"
smtp_port           = "25"
smtp_user      = ""
email_sender        = ""
smtp_password       = ""

# Logs Database Configuration
log_db_name       = "ml_payroll_pro_logs"
log_db_host       = "/cloudsql/paypro-preprod:asia-southeast1:paypro-preprod"
log_db_user_name  = "paypro-preprod-app-user"
log_db_client     = "mysql"
log_db_port       = "3306"
log_db_password   = "!!! UPDATE IN CLOUD BUILD !!!"
log_db_socket_path = "/cloudsql/paypro-preprod:asia-southeast1:paypro-preprod"
# ReCAPTCHA Configuration for dev
next_public_recaptcha_site_key = "6LcAEswqAAAAAED_GRwL-pnOQVjcy-XGtAdnSAAH"
next_public_recaptcha_secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

# File Upload URL
next_public_ml_file_upload_url = "https://objectstorage.ap-tokyo-1.oraclecloud.com/p/D5nL2BrtQH1n2QszHTZBXzGVehpb3nhmhx9szLAn1fsDqNZoXTdfrxaOF-fPEHof/n/nr7audjfcmkp/b/repository/o/payrollpro"

api_key = "MLPProApiKey"
secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

# ML Loan Schedule Keys
ml_loan_sched_pub_key = "!!! UPDATE IN CLOUD BUILD !!!"
ml_loan_sched_priv_key = "!!! UPDATE IN CLOUD BUILD !!!"

# batch upload
ml_batch_upload_username = "BatchUploadProUsr"
ml_batch_upload_client_id = "MLHUILLIER"
ml_batch_upload_api_key = "brHUWCTxOm"
ml_batch_upload_secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

# SMS Configuration
ml_sms_username = "tH35mSq12ov!D3r10113"
ml_sms_password = "!!! UPDATE IN CLOUD BUILD !!!"
ml_sms_sender = "MLWALLET"

# Payroll service
ml_payroll_api_key = "hrisApiKey"
ml_payroll_secret_key = "!!! UPDATE IN CLOUD BUILD !!!"
ml_anti_tampering_secret = "!!! UPDATE IN CLOUD BUILD !!!"

# JWT Configuration
next_public_jwt = "!!! UPDATE IN CLOUD BUILD !!!"
nextauth_secret = "!!! UPDATE IN CLOUD BUILD !!!"
jwt_secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

iat = "1516239022"
uni_string = "!!! UPDATE IN CLOUD BUILD !!!"

# App Engine Configuration
min_idle_instances = "0"
max_concurrent_requests = "25"
instance_class = "F1"

# GCP Cloud Storage Configuration
gcp_cloud_storage_bucket_name = "paypro-preprod.appspot.com"
gcp_cloud_storage_bucket_directory = "bulk-employee"
gcp_cloud_service_account_client_email = "!!! UPDATE IN CLOUD BUILD !!!"
gcp_cloud_service_account_private_key = "!!! UPDATE IN CLOUD BUILD !!!"
gcp_cloud_function_url_generate_failed_registration_csv = "https://handle-generate-failed-registrations-445305075291.asia-southeast1.run.app"

# Firebase Configuration
next_public_firebase_api_key = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_auth_domain = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_project_id = "paypro-preprod"
next_public_firebase_storage_bucket = "paypro-preprod.firebasestorage.app"
next_public_firebase_messaging_sending_id = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_app_id = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_database_id = "paypro-preprod"
firebase_project_id = "paypro-preprod"
firebase_database_id = "paypro-preprod"
firebase_collection_bulk_employee_responses = "bulk_employee_responses"
