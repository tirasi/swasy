#!/bin/bash

echo "🚀 Swasth AI - GCP Setup Script"
echo "================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
read -p "Enter your GCP Project ID: " PROJECT_ID

# Set project
gcloud config set project $PROJECT_ID

echo "✅ Project set to: $PROJECT_ID"

# Enable required APIs
echo "📦 Enabling required APIs..."
gcloud services enable firestore.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

echo "✅ APIs enabled"

# Install dependencies
echo "📦 Installing dependencies..."
cd server
npm install

echo "✅ Dependencies installed"

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
GCP_PROJECT_ID=$PROJECT_ID
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://your-domain.com
EOF

echo "✅ .env file created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Firebase Console and enable Firestore"
echo "2. Generate service account key and add to .env"
echo "3. Run: npm run deploy:appengine"
echo ""
echo "For detailed instructions, see GCP_DEPLOYMENT_GUIDE.md"
