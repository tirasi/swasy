# 🚀 Team Beta Submission - GCP Deployment Guide

## 📋 Project Details
- **Team Name**: Team Beta
- **Project**: Swasth AI Healthcare Management System
- **GCP Project ID**: medtech-hackathon-482215
- **Service Name**: team-beta-submission

## 🌐 Live URLs (After Deployment)
- **Frontend**: https://team-beta-submission-dot-medtech-hackathon-482215.appspot.com
- **API**: https://api-dot-medtech-hackathon-482215.appspot.com
- **Source Code**: gs://team-beta-submission-source/

## ⚡ Quick Deployment

### Prerequisites
```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# Login to GCP
gcloud auth login

# Set project
gcloud config set project medtech-hackathon-482215
```

### Deploy to GCP
```bash
# Method 1: Use deployment script (Windows)
deploy-gcp.bat

# Method 2: Manual deployment
npm run build
gcloud app deploy app.yaml --service=team-beta-submission
```

## 📦 What Gets Deployed

### Frontend Application
- **Service**: team-beta-submission
- **Runtime**: Node.js 18
- **Auto-scaling**: 1-10 instances
- **Features**: 
  - Voice Recognition (Hindi + English)
  - AI-powered appointment routing
  - Real-time notifications
  - Digital prescriptions
  - Cross-portal synchronization

### Source Code Storage
- **Location**: Google Cloud Storage
- **Bucket**: team-beta-submission-source
- **Format**: Compressed archive
- **Access**: Team members only

## 🔧 Environment Configuration

### Production Environment Variables
```env
NODE_ENV=production
VITE_API_URL=https://team-beta-submission-dot-medtech-hackathon-482215.appspot.com/api
VITE_GCP_PROJECT_ID=medtech-hackathon-482215
```

### Optional API Keys (for enhanced features)
```env
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_GOOGLE_CLOUD_API_KEY=your-gcp-api-key
```

## 🎯 Access Points

### Multi-Portal Access
- **Doctor Portal**: `/doctor`
- **Patient Portal**: `/patient` 
- **Pharmacy Portal**: `/pharmacy`
- **Admin Dashboard**: `/dashboard`

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Doctor | doctor@swasth.ai | doctor123 |
| Patient | patient@swasth.ai | patient123 |
| Pharmacy | pharmacy@swasth.ai | pharmacy123 |

## 📱 Features Available

### ✅ Core Features (No API Keys Required)
- Multi-language voice input (Hindi + English)
- AI-powered specialist routing
- Real-time appointment booking
- Digital prescription system
- Cross-portal notifications
- Token-based queue management
- Emergency alert system

### 🚀 Enhanced Features (With API Keys)
- Advanced AI diagnosis reports
- Cloud-based data synchronization
- SMS notifications
- Enhanced voice recognition

## 🔍 Monitoring & Logs

### View Application Logs
```bash
gcloud app logs tail -s team-beta-submission
```

### Monitor Performance
```bash
gcloud app browse -s team-beta-submission
```

## 🛠️ Troubleshooting

### Common Issues
1. **Build Fails**: Check Node.js version (requires 18+)
2. **Deployment Timeout**: Increase timeout in app.yaml
3. **API Errors**: Verify environment variables

### Support Commands
```bash
# Check deployment status
gcloud app versions list --service=team-beta-submission

# View service details
gcloud app describe --service=team-beta-submission

# Delete version (if needed)
gcloud app versions delete v1 --service=team-beta-submission
```

## 📊 Project Structure
```
team-beta-submission/
├── src/                    # Frontend source code
├── server/                 # Backend API
├── app.yaml               # GCP App Engine config
├── deploy-gcp.bat         # Deployment script
└── package.json           # Dependencies
```

## 🏆 Submission Details
- **Submitted By**: Team Beta
- **Submission Date**: [Auto-generated on deployment]
- **Version**: 1.0.0
- **Platform**: Google Cloud Platform
- **Status**: Production Ready

---
**Team Beta - Swasth AI Healthcare Management System**