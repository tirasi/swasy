@echo off
echo Deploying to Google App Engine...
echo Project: medtech-hackathon-482215

cd server

echo Setting project...
call gcloud config set project medtech-hackathon-482215

echo Deploying application...
call gcloud app deploy app.yaml --quiet

echo.
echo Deployment complete!
echo Your app will be available at: https://medtech-hackathon-482215.appspot.com
pause
