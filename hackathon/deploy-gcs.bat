@echo off
echo 🚀 Deploying Team Beta Submission to GCP Cloud Storage...

REM Set project
gcloud config set project medtech-hackathon-482215

REM Build the application
echo 📦 Building application...
call npm run build

REM Create bucket for static hosting
echo 🪣 Creating Cloud Storage bucket...
gsutil mb gs://team-beta-submission 2>nul
gsutil web set -m index.html -e index.html gs://team-beta-submission

REM Upload files
echo ☁️ Uploading files to Cloud Storage...
gsutil -m cp -r dist/* gs://team-beta-submission/

REM Make bucket public
echo 🌐 Making bucket publicly accessible...
gsutil iam ch allUsers:objectViewer gs://team-beta-submission

echo ✅ Deployment Complete!
echo 🌐 URL: https://storage.googleapis.com/team-beta-submission/index.html

pause