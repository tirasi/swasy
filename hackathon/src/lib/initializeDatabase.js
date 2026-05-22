// Complete database initialization for localStorage (fallback when Firebase is not available)
const completeDatabase = {
  doctors: [
    {
      id: 'doctor-1',
      name: 'Dr. Sarah Johnson',
      email: 'doctor@test.com',
      specialty: 'Cardiology',
      license: 'MD123456',
      phone: '+91-9876543210',
      experience: 15,
      verified: true,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      consultationFee: 500,
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor-2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@hospital.com',
      specialty: 'Neurology',
      license: 'MD789012',
      phone: '+91-9876543211',
      experience: 12,
      verified: true,
      availability: ['Monday', 'Wednesday', 'Friday'],
      consultationFee: 600,
      createdAt: new Date().toISOString()
    }
  ],

  patients: [
    {
      id: 'patient-1',
      name: 'John Doe',
      email: 'patient@test.com',
      age: 35,
      phone: '+91-9123456789',
      symptoms: ['fever', 'headache', 'fatigue'],
      status: 'PENDING',
      priority: 'HIGH',
      gender: 'Male',
      dataToken: 'TKN12345ABC',
      reports: [{
        content: 'Patient experiencing high fever and severe headache for 3 days',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    },
    {
      id: 'patient-2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      age: 28,
      phone: '+91-9123456790',
      symptoms: ['cough', 'chest pain'],
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      gender: 'Female',
      dataToken: 'TKN67890DEF',
      reports: [{
        content: 'Persistent dry cough with mild chest discomfort',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],

  appointments: [
    {
      id: 'apt-1',
      patientId: 'patient-1',
      patientName: 'John Doe',
      patientToken: 'TKN12345ABC',
      doctorId: 'doctor-1',
      doctorName: 'Dr. Sarah Johnson',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      phone: '+91-9123456789',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString()
    }
  ],

  prescriptions: [
    {
      id: 'presc-1',
      patientId: 'patient-1',
      patientName: 'John Doe',
      medicine: 'Paracetamol 500mg',
      dosage: '1 tablet twice daily',
      duration: '5 days',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ],

  medicines: [
    {
      id: 'med-1',
      name: 'Paracetamol 500mg',
      category: 'Analgesic',
      price: 25.50,
      stock: 500,
      createdAt: new Date().toISOString()
    }
  ]
};

function initializeCompleteDatabase() {
  console.log('🌱 Initializing complete database...');
  
  Object.keys(completeDatabase).forEach(collection => {
    localStorage.setItem(collection, JSON.stringify(completeDatabase[collection]));
    console.log(`✅ ${collection}: ${completeDatabase[collection].length} records`);
  });
  
  localStorage.setItem('assignedDoctors', JSON.stringify({}));
  localStorage.setItem('emergencies', JSON.stringify([]));
  
  console.log('🎉 Database initialized!');
}

if (typeof window !== 'undefined') {
  initializeCompleteDatabase();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { completeDatabase, initializeCompleteDatabase };
}