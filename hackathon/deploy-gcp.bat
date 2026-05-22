@echo off
echo 🚀 Deploying Team Beta Submission to Google Cloud Platform...

REM Set project
gcloud config set project medtech-hackathon-482215

REM Build the application
echo 📦 Building application...
call npm run build

REM Deploy to App Engine
echo ☁️ Deploying to GCP App Engine...
gcloud app deploy app.yaml --service=team-beta-submission --version=v1 --promote --quiet

REM Store source code in Cloud Storage
echo 💾 Storing source code in Cloud Storage...
gsutil mb gs://team-beta-submission-source 2>nul
powershell Compress-Archive -Path . -DestinationPath team-beta-submission.zip -Force -Exclude node_modules,dist,.git
gsutil cp team-beta-submission.zip gs://team-beta-submission-source/
del team-beta-submission.zip

echo ✅ Deployment Complete!
echo 🌐 Frontend URL: https://team-beta-submission-dot-medtech-hackathon-482215.appspot.com
echo 💾 Source Code: gs://team-beta-submission-source/team-beta-submission.zip

pause