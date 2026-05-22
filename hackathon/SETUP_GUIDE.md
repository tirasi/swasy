# 🚀 Swasth AI Healthcare Management System - Setup Guide

## 📋 Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Modern browser** (Chrome/Edge for voice features)

## ⚡ Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/tirasi/hackathon.git
cd hackathon
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file in root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3333/api
VITE_GCP_PROJECT_ID=medtech-hackathon-482215

# Optional: OpenAI API Key (for enhanced AI features)
VITE_OPENAI_API_KEY=your_openai_key_here
```

### 4. Start Application
```bash
npm run dev
```

The app will run on `http://localhost:8080` (or next available port)

## 🎯 Default Login Credentials

### Doctor Portal
- **Email**: `doctor@swasth.ai`
- **Password**: `doctor123`

### Patient Portal  
- **Email**: `patient@swasth.ai`
- **Password**: `patient123`

### Pharmacy Portal
- **Email**: `pharmacy@swasth.ai` 
- **Password**: `pharmacy123`

## 🔧 Features That Work Without API Keys

✅ **Core Features (No API needed)**:
- Patient registration & management
- Doctor dashboard with real patients
- Appointment booking with AI routing
- Voice recognition (Hindi + English)
- Real-time notifications
- Digital prescriptions
- Cross-portal synchronization
- Token-based queue system

⚠️ **Enhanced Features (Require API keys)**:
- Advanced AI diagnosis reports
- External integrations
- Cloud storage

## 🎤 Voice Recognition Setup

### Browser Requirements:
- **Chrome** (Recommended)
- **Edge** 
- **Safari** (Limited support)

### Enable Microphone:
1. Allow microphone access when prompted
2. Ensure HTTPS or localhost for security
3. Test with both Hindi and English

## 🏥 How to Test the System

### 1. Patient Flow:
1. Go to Patient Portal
2. Submit health report (try voice input)
3. Book appointment 
4. Get token number

### 2. Doctor Flow:
1. Go to Doctor Portal  
2. See real-time patient notifications
3. Review AI analysis
4. Generate prescriptions

### 3. Cross-Portal Sync:
- Book appointment in Patient Portal
- Instantly see it in Doctor Portal
- Real-time notifications work

## 🐛 Troubleshooting

### Voice Not Working?
- Use Chrome browser
- Allow microphone permissions
- Check HTTPS/localhost

### No Patients Showing?
- App auto-creates sample data
- Check browser console for errors
- Clear localStorage if needed

### Port Issues?
- App auto-finds available port
- Check terminal for actual URL

## 📱 Mobile Testing
- Responsive design works on mobile
- Voice features may be limited on mobile browsers

## 🔄 Data Persistence
- Uses localStorage for demo
- Data persists between sessions
- Clear browser data to reset

## 🆘 Need Help?
All features work locally without external dependencies. The system is designed to run completely offline for demo purposes.

**Repository**: https://github.com/tirasi/hackathon.git