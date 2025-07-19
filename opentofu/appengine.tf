# Create App Engine application
resource "google_app_engine_application" "app" {
  project     = var.project_id
  location_id = var.app_engine_location

  depends_on = [google_project_service.required_apis]
}

resource "google_project_iam_member" "appengine_storage_user" {
  project = var.project_id
  role    = "roles/storage.objectUser"
  member  = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"

  depends_on = [google_app_engine_application.app]
}
