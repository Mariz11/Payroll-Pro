environment         = "prod"
tag_pattern         = "^pp-v*.*.*$"
cloudbuild_filename = "cloudbuild.yaml"
project_id         = "paypro-prod"
project_number     = "104920350083"
api_title          = "Paypro (Prod)"
api_description    = "Paypro - Prod Environment"
db_name            = "ml_payroll_pro"
db_socket_path     = "/cloudsql/paypro-prod:asia-southeast1:paypro-prod"
database_tier = "db-n1-standard-1"
database_availability_type = "ZONAL"

# Database configuration
db_client          = "mysql"
db_port            = "3306"
db_host             = "/cloudsql/paypro-prod:asia-southeast1:paypro-prod"
db_user_name        = "paypro-prod-app-user"
db_password        = "!!! UPDATE IN CLOUD BUILD !!!"
# Default values for non-sensitive configurations
next_public_autolock_timeout = "300000"
db_pool_max        = "1000"
db_pool_min        = "0"
db_pool_acquire    = "30000"
db_pool_idle       = "10000"

# API Domains for dev environment
ml_auth_service_api_domain = "https://ml.zebra.mlhuillier.net"
ml_payroll_api_domain     = "https://ml-payroll-prod.df.r.appspot.com"
ml_ckyc_api_domain      = "https://ml-ckyc-prod.df.r.appspot.com/"
ml_batch_upload_domain = "https://lion.mlhuillier.net/MLPayrollLite"
ml_sms_api_domain     = "https://tyrannosaurus.mlhuillier.com/MLSMSProviderv2"
ml_loans_domain      = "https://xeme.mlhuillier.net"
ml_kpx_domain       = "https://zebra.mlhuillier.net"
ml_notification_api_domain = "https://ml-notification-service-prod.df.r.appspot.com"

base_path           = "https://paypro-prod.as.r.appspot.com"

# Email Configuration for dev
smtp_host           = "phcebpostfix.mlinc.com"
smtp_service        = "gmail"
smtp_port           = "25"
smtp_user      = ""
email_sender        = ""
smtp_password       = ""

# Logs Database Configuration
log_db_name       = "ml_payroll_pro_logs"
log_db_host       = "/cloudsql/paypro-prod:asia-southeast1:paypro-prod"
log_db_user_name  = "paypro-prod-app-user"
log_db_client     = "mysql"
log_db_port       = "3306"
log_db_password   = "!!! UPDATE IN CLOUD BUILD !!!"
log_db_socket_path = "/cloudsql/paypro-prod:asia-southeast1:paypro-prod"
# ReCAPTCHA Configuration for dev
next_public_recaptcha_site_key = "6LfxZs0qAAAAAM0Cbx7VxZSVaofAcMRhSpX_LsiG"
next_public_recaptcha_secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

# File Upload URL
next_public_ml_file_upload_url = "https://objectstorage.ap-tokyo-1.oraclecloud.com/p/9HkHLQCLjpajm-YNVXTmC4CYIQLDAbuLXFFR9EDufLQCqjoxvUUc-At8haGFBqSy/n/nr7audjfcmkp/b/Repository/o/payrollpro"

api_key = "xGdsadfsa8i1scjaj112eoxlpGHAval111"
secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

# ML Loan Schedule Keys
ml_loan_sched_pub_key = "!!! UPDATE IN CLOUD BUILD !!!"
ml_loan_sched_priv_key = "!!! UPDATE IN CLOUD BUILD !!!"

# batch upload
ml_batch_upload_username = "NjpqVuSlnWTygzoPRO"
ml_batch_upload_client_id = "MLHUILLIER"
ml_batch_upload_api_key = "AWEKFv1MhK"
ml_batch_upload_secret_key = "!!! UPDATE IN CLOUD BUILD !!!"

# SMS Configuration
ml_sms_username = "tH35mSq12ov!D3r10113"
ml_sms_password = "!!! UPDATE IN CLOUD BUILD !!!"
ml_sms_sender = "MLHUILLIER"

# Payroll service
ml_payroll_api_key = "MKqs72hv8kHGgdCK"
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
gcp_cloud_storage_bucket_name = "paypro-prod.appspot.com"
gcp_cloud_storage_bucket_directory = "bulk-employee"
gcp_cloud_service_account_client_email = "!!! UPDATE IN CLOUD BUILD !!!"
gcp_cloud_service_account_private_key = "!!! UPDATE IN CLOUD BUILD !!!"
gcp_cloud_function_url_generate_failed_registration_csv = "https://handle-generate-failed-registrations-445305075291.asia-southeast1.run.app"

# Firebase Configuration
next_public_firebase_api_key = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_auth_domain = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_project_id = "paypro-prod"
next_public_firebase_storage_bucket = "paypro-prod.firebasestorage.app"
next_public_firebase_messaging_sending_id = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_app_id = "!!! UPDATE IN CLOUD BUILD !!!"
next_public_firebase_database_id = "paypro-prod"
firebase_project_id = "paypro-prod"
firebase_database_id = "paypro-prod"
firebase_collection_bulk_employee_responses = "bulk_employee_responses"
