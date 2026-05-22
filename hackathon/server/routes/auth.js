const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/PatientFirestore');
const Doctor = require('../models/DoctorFirestore');

const router = express.Router();

// Input validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;

// Patient Google OAuth login
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }
    
    let patient = await Patient.findOne({ email });
    
    if (!patient) {
      patient = new Patient({
        name: name || 'User',
        email,
        phone: '9853224443',
        age: 25,
        googleId,
        provider: 'google',
        symptoms: []
      });
      await patient.save();
    }
    
    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

// Doctor/Pharmacy login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }
    
    // Demo credentials with hashed passwords
    const demoCredentials = {
      'doctor@test.com': { 
        password: await bcrypt.hash('doctor123', 10), 
        role: 'doctor' 
      },
      'pharmacy@test.com': { 
        password: await bcrypt.hash('pharmacy123', 10), 
        role: 'pharmacy' 
      },
      'admin@swasthai.com': { 
        password: await bcrypt.hash('admin123', 10), 
        role: 'admin' 
      }
    };
    
    const demo = demoCredentials[email];
    if (!demo) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const passwordMatch = await bcrypt.compare(password, demo.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Use server-side role, not client-provided role
    const token = jwt.sign(
      { email, role: demo.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: { email, role: demo.role, name: `Demo ${demo.role}` }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

module.exports = router;