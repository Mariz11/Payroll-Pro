# Regular Developer Role
resource "google_project_iam_custom_role" "regular_developer" {
  role_id     = "regularDeveloper"
  title       = "Regular Developer Role"
  description = "Custom role for regular developers with logs viewer access"
  permissions = [
    "logging.logs.list",
    "logging.logEntries.list",
    "logging.logServices.list"
  ]
}

# Tech Lead Role
resource "google_project_iam_custom_role" "tech_lead" {
  role_id     = "techLead"
  title       = "Tech Lead Role"
  description = "Custom role for tech leads with elevated permissions"
  permissions = [
    # IAM Admin permissions
    "iam.roles.create",
    "iam.roles.delete",
    "iam.roles.get",
    "iam.roles.list",
    "iam.roles.update",
    "iam.serviceAccounts.create",
    "iam.serviceAccounts.delete",
    "iam.serviceAccounts.get",
    "iam.serviceAccounts.list",
    "iam.serviceAccounts.update",

    "resourcemanager.projects.get",
    "resourcemanager.projects.getIamPolicy",
    "resourcemanager.projects.setIamPolicy",

    # Cloud Build permissions
    "cloudbuild.builds.create",
    "cloudbuild.builds.get",
    "cloudbuild.builds.list",
    "cloudbuild.builds.update",

    # App Engine permissions
    "appengine.applications.create",
    "appengine.applications.get",
    "appengine.applications.update",
    "appengine.services.list",
    "appengine.services.update",

    # Secret Manager permissions
    "secretmanager.secrets.create",
    "secretmanager.secrets.delete",
    "secretmanager.secrets.get",
    "secretmanager.secrets.list",
    "secretmanager.secrets.update",
    "secretmanager.versions.access",
    "secretmanager.versions.add",
    "secretmanager.versions.destroy",

    # Logs Admin permissions
    "logging.logEntries.create",
    "logging.logEntries.list",
    "logging.logMetrics.create",
    "logging.logMetrics.delete",
    "logging.logMetrics.get",
    "logging.logMetrics.list",
    "logging.logMetrics.update",
    "logging.logs.list",
    "logging.sinks.create",
    "logging.sinks.delete",
    "logging.sinks.get",
    "logging.sinks.list",
    "logging.sinks.update"
  ]
}

# Tech Lead Support Role
resource "google_project_iam_custom_role" "tech_lead_support" {
  role_id     = "techLeadSupport"
  title       = "Tech Lead Support Role"
  description = "Custom role for tech lead support with build and logs access"
  permissions = [
    # Cloud Build permissions
    "cloudbuild.builds.create",
    "cloudbuild.builds.get",
    "cloudbuild.builds.list",
    "cloudbuild.builds.update",

    # Logs Viewer permissions
    "logging.logs.list",
    "logging.logEntries.list",
    "logging.logServices.list"
  ]
}
