#!/bin/bash

# Team Beta Submission - GCP Deployment Script
echo "🚀 Deploying Team Beta Submission to Google Cloud Platform..."

# Source environment variables
if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Set project
gcloud config set project $GCP_PROJECT_ID

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to App Engine
echo "☁️ Deploying to GCP App Engine..."
gcloud app deploy app.yaml --service=team-beta-submission --version=v1 --promote --quiet

# Deploy backend API
echo "🔧 Deploying backend API..."
cd server
gcloud app deploy app.yaml --service=api --version=v1 --promote --quiet
cd ..

# Store source code in Cloud Storage
echo "💾 Storing source code in Cloud Storage..."
gsutil mb gs://team-beta-submission-source 2>/dev/null || true
tar -czf team-beta-submission.tar.gz --exclude=node_modules --exclude=dist --exclude=.git .
gsutil cp team-beta-submission.tar.gz gs://team-beta-submission-source/
rm team-beta-submission.tar.gz

echo "✅ Deployment Complete!"
echo "🌐 Frontend URL: https://team-beta-submission-dot-$GCP_PROJECT_ID.appspot.com"
echo "🔧 API URL: https://api-dot-$GCP_PROJECT_ID.appspot.com"
echo "💾 Source Code: gs://team-beta-submission-source/team-beta-submission.tar.gz"