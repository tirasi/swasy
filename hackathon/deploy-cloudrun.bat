@echo off
echo Deploying to Google Cloud Run...
echo Project: medtech-hackathon-482215

cd server

echo Building and deploying...
call gcloud config set project medtech-hackathon-482215
call gcloud run deploy swasth-ai --source . --platform managed --region us-central1 --allow-unauthenticated --set-env-vars GCP_PROJECT_ID=medtech-hackathon-482215,JWT_SECRET=4151dc94dde9cfcf896ca270b9635e3e8d505d7ea2f31f8bd7d289ee6f9b5dfe,NODE_ENV=production,PORT=8080

echo.
echo Deployment complete!
echo Check Cloud Run console for service URL
pause
