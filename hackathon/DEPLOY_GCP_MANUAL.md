# 🚀 Team Beta Submission - GCP Deployment Instructions

## Prerequisites
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Login: `gcloud auth login`
3. Set project: `gcloud config set project medtech-hackathon-482215`

## Deploy to GCP Cloud Storage

### Step 1: Build Application
```bash
npm run build
```

### Step 2: Create Storage Bucket
```bash
gsutil mb gs://team-beta-submission-app
gsutil web set -m index.html -e index.html gs://team-beta-submission-app
```

### Step 3: Upload Files
```bash
gsutil -m cp -r dist/* gs://team-beta-submission-app/
```

### Step 4: Make Public
```bash
gsutil iam ch allUsers:objectViewer gs://team-beta-submission-app
```

### Step 5: Set CORS (for SPA routing)
```bash
echo '[{"origin":["*"],"method":["GET","HEAD"],"responseHeader":["*"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://team-beta-submission-app
```

## Alternative: App Engine Deployment

### Deploy with App Engine
```bash
gcloud app deploy app.yaml --service=team-beta-submission --version=v1
```

## URLs After Deployment
- **Cloud Storage**: https://storage.googleapis.com/team-beta-submission-app/index.html
- **App Engine**: https://team-beta-submission-dot-medtech-hackathon-482215.appspot.com

## Manual Upload (If CLI not available)
1. Go to: https://console.cloud.google.com/storage
2. Create bucket: `team-beta-submission-app`
3. Upload all files from `dist/` folder
4. Make bucket public
5. Set website configuration: index.html

The application is ready for GCP deployment with all necessary configuration files.