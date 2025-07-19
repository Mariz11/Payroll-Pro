# Add Cloud SQL instance
resource "google_sql_database_instance" "sql_instance" {
  name             = "${var.service_name}-${var.environment}"
  database_version = "MYSQL_8_0_36"
  region          = var.region
  project         = var.project_id

  settings {
    tier = var.database_tier
    edition = "ENTERPRISE"

    availability_type = var.database_availability_type
    disk_size = 10
    disk_autoresize = true
    disk_autoresize_limit = 0  # No limit
    deletion_protection_enabled = true

    backup_configuration {
      enabled                        = true
      binary_log_enabled            = true
      start_time                     = "17:00"  # UTC time (1:00 AM GMT+8)
      backup_retention_settings {
        retained_backups = 30
        retention_unit  = "COUNT"
      }
      # Backup window is 17:00-21:00 UTC (1:00 AM - 5:00 AM GMT+8)
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length    = 1024
      record_application_tags = true
      record_client_address  = true
      query_plans_per_minute = 8
    }

    database_flags {
      name  = "default_time_zone"
      value = "+08:00"
    }

    database_flags {
      name  = "net_write_timeout"
      value = "1000"
    }

    database_flags {
      name  = "net_read_timeout"
      value = "1000"
    }

    database_flags {
      name  = "max_connections"
      value = "10000"
    }

    database_flags {
      name  = "slow_query_log"
      value = "on"
    }

    database_flags {
      name  = "general_log"
      value = "on"
    }

    database_flags {
      name  = "cloudsql_iam_authentication"
      value = "on"
    }

    database_flags {
      name  = "sql_mode"
      value = "NO_ENGINE_SUBSTITUTION"
    }

    database_flags {
      name  = "max_allowed_packet"
      value = "134217728"  # 128MB in bytes
    }
  }

  depends_on = [google_project_service.required_apis]
}

# Create the database
resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.sql_instance.name
  project  = var.project_id
}

# Grant Cloud SQL Client role to App Engine service account
resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"

  depends_on = [google_app_engine_application.app]
}

# Generate random passwords
resource "random_password" "temp_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Create root user
resource "google_sql_user" "root" {
  name     = "root"
  instance = google_sql_database_instance.sql_instance.name
  host     = "%"
  password = random_password.temp_password.result
  project  = var.project_id

  depends_on = [google_sql_database_instance.sql_instance]

  lifecycle {
    ignore_changes = [password]
  }
}

# Create ml_dev_user
resource "google_sql_user" "ml_dev_user" {
  name     = "ml_dev_user"
  instance = google_sql_database_instance.sql_instance.name
  host     = "%"
  password = random_password.temp_password.result
  project  = var.project_id

  depends_on = [google_sql_database_instance.sql_instance]

  lifecycle {
    ignore_changes = [password]
  }
}

# Create viewer user
resource "google_sql_user" "viewer" {
  name     = "viewer"
  instance = google_sql_database_instance.sql_instance.name
  host     = "%"
  password = random_password.temp_password.result
  project  = var.project_id

  depends_on = [google_sql_database_instance.sql_instance]

  lifecycle {
    ignore_changes = [password]
  }
}

# Create application user
resource "google_sql_user" "app_user" {
  name     = "${var.service_name}-${var.environment}-app-user"
  instance = google_sql_database_instance.sql_instance.name
  host     = "%"
  password = random_password.temp_password.result
  project  = var.project_id

  depends_on = [google_sql_database_instance.sql_instance]

  lifecycle {
    ignore_changes = [password]
  }
}
