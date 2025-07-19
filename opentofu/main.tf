terraform {
  backend "gcs" {
    # Backend configuration will be provided via backend config file
  }

  required_providers {
    random = {
      source = "hashicorp/random"
    }
  }
}

# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "appengine.googleapis.com",
    "cloudbuild.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "cloudprofiler.googleapis.com",
    "cloudfunctions.googleapis.com"
  ])

  project = var.project_id
  service = each.key

  disable_dependent_services = false
  disable_on_destroy        = false
}
