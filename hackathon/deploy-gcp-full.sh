#!/bin/bash

# Team Beta Submission - Complete GCP Deployment
echo "🚀 Deploying Team Beta Submission to GCP with Load Balancer..."

# Set project
gcloud config set project medtech-hackathon-482215

# Build application
echo "📦 Building application..."
npm run build

# Create Cloud Storage bucket
echo "🪣 Creating Cloud Storage bucket..."
gsutil mb gs://team-beta-submission-app 2>/dev/null || true
gsutil web set -m index.html -e index.html gs://team-beta-submission-app

# Upload files
echo "☁️ Uploading files..."
gsutil -m cp -r dist/* gs://team-beta-submission-app/

# Make bucket public
echo "🌐 Making bucket public..."
gsutil iam ch allUsers:objectViewer gs://team-beta-submission-app

# Create Load Balancer backend bucket
echo "⚖️ Creating Load Balancer..."
gcloud compute backend-buckets create team-beta-backend \
    --gcs-bucket-name=team-beta-submission-app \
    --enable-cdn

# Create URL map
gcloud compute url-maps create team-beta-urlmap \
    --default-backend-bucket=team-beta-backend

# Create HTTP(S) proxy
gcloud compute target-http-proxies create team-beta-http-proxy \
    --url-map=team-beta-urlmap

# Create forwarding rule
gcloud compute forwarding-rules create team-beta-forwarding-rule \
    --global \
    --target-http-proxy=team-beta-http-proxy \
    --ports=80

# Get external IP
EXTERNAL_IP=$(gcloud compute forwarding-rules describe team-beta-forwarding-rule --global --format="value(IPAddress)")

echo "✅ Deployment Complete!"
echo "🌐 URL: http://$EXTERNAL_IP"
echo "🪣 Bucket: gs://team-beta-submission-app"