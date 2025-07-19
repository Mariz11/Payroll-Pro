# Infrastructure Deployment Guide

This guide explains how to deploy the infrastructure using OpenTofu (an open source alternative to Terraform).

## Prerequisites

### 1. Install OpenTofu

Download and install OpenTofu:

```bash
# macOS with Homebrew
brew install opentofu

# Verify installation
tofu version
```

For other operating systems, visit the [OpenTofu installation guide](https://opentofu.org/docs/intro/install/).

### 2. Install Google Cloud SDK

1. Install the Google Cloud SDK following the [official documentation](https://cloud.google.com/sdk/docs/install)
2. Initialize gcloud and authenticate:

```bash
# Initialize gcloud
gcloud init

# Authenticate application default credentials
gcloud auth application-default login
```

## Configuration

### 1. Configure gcloud

First, list and verify your available projects:

```bash
# List available projects
gcloud projects list
```

Then set the correct project and region:

```bash
# Ensure you're logged in with the correct account
gcloud auth login

# Set the project
gcloud config set project <env-specific-project-id>

# Verify the project is set correctly
gcloud config get-value project

# Set quota project for ADC
gcloud auth application-default set-quota-project <env-specific-project-id>

# Set up Application Default Credentials (ADC)
gcloud auth application-default login
```

Note: The Application Default Credentials (ADC) are essential for OpenTofu to authenticate with Google Cloud. Make sure you're logged in with an account that has the necessary permissions. Setting the quota project ensures that API usage is billed to the correct project.

## Deployment Steps

### 1. Initialize OpenTofu

```bash
# Navigate to the OpenTofu directory
cd paypro/opentofu

# Create the GCS bucket if it doesn't exist
gsutil mb -l asia-southeast1 -b on gs://paypro-tfstate

# Initialize OpenTofu with backend configuration
tofu init -backend-config=backend.conf
```

### 2. Select Environment

```bash
tofu workspace new paypro-<env>
tofu workspace select paypro-<env>
```

### 3. Configuration

- Connect the paypro repository to the cloud build repositories.

Double check the configuration and the values in the tfvars file to ensure that it is correct.
Make the necessary changes if needed.

### 4. Plan the Deployment

```bash
# Create execution plan
tofu plan -var-file=common.tfvars -var-file=<env>.tfvars
```

### 5. Apply the Configuration. !!! IMPORTANT: Make sure that you are applying it to the correct GCP project. !!!

```bash
# Apply the configuration
tofu apply -var-file=common.tfvars -var-file=<env>.tfvars
```

## Infrastructure Components

## Important Notes

1. The Cloud SQL instance has deletion protection enabled.
2. Cloud Build triggers are initially disabled (controlled by `trigger_disabled` variable)
3. All resources are created in the `asia-southeast1` region.

## Post-Deployment Steps

After successful deployment:

1. Database passwords are generated randomly and should be updated manually in SQL instance.
2. The secrets don't have any values set so it needs to be updated manually in Secret Manager.
3. Duplicate the initial-trigger Cloud Build trigger and make the necessary changes to trigger on the correct branch.
4. Double check the Cloud build trigger configuration and substitutions to ensure it's correctly set up.
5. Double check the PubSub subscriptions to ensure they are correctly set up.

## Troubleshooting

Common issues and solutions:

1. **Backend Configuration Failed**
   - Ensure you have the correct permissions on the GCS bucket
   - Verify the bucket exists and is accessible

2. **API Enablement Failed**
   - Ensure you have organization permissions to enable APIs
   - Wait a few minutes and retry as API enablement can be eventually consistent

3. **Cloud SQL Creation Failed**
   - Verify quota limits in the project
   - Ensure the specified region supports the requested database tier

## Support

For additional support:
- Review the OpenTofu documentation
- Check the Google Cloud documentation
- Contact the tech lead for the project.
