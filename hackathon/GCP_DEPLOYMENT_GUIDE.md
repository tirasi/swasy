# Google Cloud Platform Deployment Guide

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Firebase Project** created
3. **gcloud CLI** installed: https://cloud.google.com/sdk/docs/install

## Step 1: Set Up Firebase

### 1.1 Create Firebase Project
```bash
# Go to Firebase Console
https://console.firebase.google.com/

# Create new project or select existing
# Enable Firestore Database in Native mode
```

### 1.2 Generate Service Account Key
```bash
# Go to Project Settings > Service Accounts
# Click "Generate New Private Key"
# Save as service-account-key.json (DO NOT COMMIT)
```

### 1.3 Set Environment Variables
```bash
# For local development, create .env file:
GCP_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=development
PORT=8080
```

## Step 2: Install Dependencies

```bash
cd server
npm install firebase-admin
```

## Step 3: Initialize gcloud

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable firestore.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable run.googleapis.com
```

## Step 4: Deploy to Google Cloud

### Option A: App Engine (Recommended for beginners)

```bash
# Update app.yaml with your project ID and secrets
# Then deploy:
cd server
gcloud app deploy

# View logs
gcloud app logs tail -s default

# Open in browser
gcloud app browse
```

### Option B: Cloud Run (Recommended for scalability)

```bash
# Build and deploy
cd server
gcloud run deploy swasth-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=YOUR_PROJECT_ID,JWT_SECRET=YOUR_SECRET

# Get service URL
gcloud run services describe swasth-ai --region us-central1
```

### Option C: Compute Engine (Full control)

```bash
# Create VM instance
gcloud compute instances create swasth-ai-vm \
  --machine-type=e2-medium \
  --zone=us-central1-a \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud

# SSH into instance
gcloud compute ssh swasth-ai-vm --zone=us-central1-a

# Install Node.js and deploy
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
# Copy your code and run
```

## Step 5: Set Up Firestore Security Rules

```javascript
// Go to Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Doctors collection
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Patients collection
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Configure Frontend

Update frontend API endpoint:
```typescript
// In your frontend .env
VITE_API_URL=https://YOUR_PROJECT_ID.appspot.com/api
# OR for Cloud Run
VITE_API_URL=https://swasth-ai-xxxxx.run.app/api
```

## Step 7: Set Up CI/CD (Optional)

### Using Cloud Build

Create `cloudbuild.yaml`:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
    dir: 'server'
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['app', 'deploy']
    dir: 'server'
```

Connect to GitHub:
```bash
gcloud builds triggers create github \
  --repo-name=YOUR_REPO \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## Monitoring & Logging

### View Logs
```bash
# App Engine
gcloud app logs tail -s default

# Cloud Run
gcloud run services logs read swasth-ai --region us-central1

# Firestore
# Go to Firebase Console > Firestore > Usage tab
```

### Set Up Monitoring
```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# View in console
https://console.cloud.google.com/monitoring
```

## Cost Optimization

1. **Firestore**: Free tier includes 1GB storage, 50K reads/day
2. **App Engine**: F1 instance ~$50/month
3. **Cloud Run**: Pay per request, free tier available
4. **Compute Engine**: e2-micro eligible for free tier

## Security Checklist

- [ ] Service account key stored securely (not in git)
- [ ] JWT_SECRET is strong and unique
- [ ] Firestore security rules configured
- [ ] CORS configured for your domain only
- [ ] HTTPS enforced (automatic on GCP)
- [ ] Rate limiting enabled
- [ ] Environment variables set in GCP console

## Troubleshooting

### Issue: "Permission denied"
```bash
# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/editor"
```

### Issue: "Firestore not initialized"
- Check GCP_PROJECT_ID is set correctly
- Verify Firestore is enabled in Firebase Console
- Check service account has Firestore permissions

### Issue: "Module not found"
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

## Support

- GCP Documentation: https://cloud.google.com/docs
- Firebase Documentation: https://firebase.google.com/docs
- Stack Overflow: Tag with `google-cloud-platform` and `firebase`
