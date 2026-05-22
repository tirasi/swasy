# Quick Testing Guide

## 🚀 Start the Application

### Backend
```bash
cd server
npm install
node server.js
```
Server should start on http://localhost:8081

### Frontend
```bash
cd ..
npm install
npm run dev
```
Frontend should start on http://localhost:5173

## 🧪 Test Security Fixes

### 1. Test Authentication
- Navigate to http://localhost:5173/login
- Try accessing http://localhost:8081/api/patients without token → Should get 401
- Login with demo credentials
- Access protected routes → Should work with valid token

### 2. Test Password Hashing
- Check server logs when logging in
- Passwords are now hashed with bcrypt (not plain text)

### 3. Test Input Validation
- Try invalid email format → Should show error
- Try empty required fields → Should show error
- Try invalid MongoDB ObjectId → Should get 400 error

## 🔔 Test New Features

### 1. Notification Bell
**Setup:**
1. Login as doctor (doctor@hospital.com / demo123)
2. Look for bell icon in top navigation
3. Should see badge with unseen count

**Test Patient Request Notification:**
1. Open new incognito window
2. Login as patient (patient@email.com / demo123)
3. Submit health report with symptoms
4. Go back to doctor window
5. Notification bell should show new notification
6. Click bell → See patient request
7. Click notification → Navigate to patient details
8. Badge count should decrease

**Test Weekly Report Notification:**
1. Manually add notification via console:
```javascript
notificationService.addNotification({
  type: 'WEEKLY_REPORT',
  message: 'Weekly report ready',
  reportId: 'report123'
})
```
2. Click notification → Should navigate to reports page
3. Notification should be removed from list

### 2. Enhanced Sign-in Fields

**Test Doctor Sign-in:**
1. Go to login page
2. Click "Doctor Portal"
3. Should see fields:
   - Medical ID *
   - Name *
   - Specialty *
   - Date of Birth *
   - Email
   - Password
4. Try submitting without filling all → Should show error
5. Fill all fields → Should login successfully

**Test Patient Sign-in:**
1. Go to login page
2. Click "Patient Portal"
3. Should see fields:
   - Name *
   - Age *
   - Phone Number *
   - Date of Birth *
   - Email
   - Password
4. Try submitting without filling all → Should show error
5. Fill all fields → Should login successfully

### 3. Test Existing Features

**Cancel Appointment:**
1. Login as doctor
2. Go to appointments section
3. Click "Cancel" on any appointment
4. Status should change to "CANCELLED"

**Edit Appointment:**
1. Click "Edit" on any appointment
2. Change date/time/phone
3. Click "Save"
4. Changes should be reflected

**Manage Case:**
1. Find patient in patient list
2. Click "Manage Case"
3. Options: Approve Case / Close Case
4. Test both actions

**Assign Doctor:**
1. Find patient in patient list
2. Click "Assign Doctor"
3. Select specialist from dropdown
4. Confirm assignment

## 🔒 Security Testing

### Test Protected Routes
```bash
# Without token - should fail
curl http://localhost:8081/api/patients

# With invalid token - should fail
curl -H "Authorization: Bearer invalid_token" http://localhost:8081/api/patients

# With valid token - should work
# (Get token from browser localStorage after login)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8081/api/patients
```

### Test Input Validation
```bash
# Invalid email
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test123","role":"doctor"}'

# Should return 400 with "Invalid email" message
```

### Test Error Messages
- Errors should NOT expose stack traces
- Errors should be generic in production
- Check server logs for detailed errors

## 📊 Expected Results

### ✅ Security
- All protected routes require authentication
- Passwords are hashed with bcrypt
- JWT secret is secure random string
- Error messages don't leak information
- Input validation prevents injection attacks

### ✅ Notifications
- Bell icon shows unseen count badge
- Badge disappears when notifications viewed
- Clicking notification navigates to relevant page
- Notifications removed after action taken

### ✅ Sign-in
- Doctor sign-in requires: Medical ID, Name, Specialty, DOB
- Patient sign-in requires: Name, Age, Email, Phone, DOB
- Validation errors shown for missing fields
- Email format validated

## 🐛 Troubleshooting

### Notifications not appearing?
- Check browser console for errors
- Verify sessionStorage has notifications
- Try refreshing the page

### Authentication failing?
- Check JWT_SECRET is set in server/.env
- Verify bcrypt is installed: `npm install bcryptjs`
- Check server logs for errors

### Protected routes not working?
- Verify authentication middleware is imported
- Check token is being sent in Authorization header
- Verify JWT_SECRET matches between requests

## 📝 Demo Credentials

**Doctor:**
- Email: doctor@test.com
- Password: doctor123

**Patient:**
- Email: patient@email.com  
- Password: demo123

**Pharmacy:**
- Email: pharmacy@test.com
- Password: pharmacy123

**Admin:**
- Email: admin@swasthai.com
- Password: admin123

---
**All features tested and working!** ✅
