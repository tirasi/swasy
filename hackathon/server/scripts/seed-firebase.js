const { initializeFirebase, admin } = require('../lib/firebase');
const db = initializeFirebase();

// Complete sample data for all collections
const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'doctor@test.com',
    specialty: 'Cardiology',
    license: 'MD123456',
    phone: '+91-9876543210',
    experience: 15,
    verified: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 500
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@hospital.com',
    specialty: 'Neurology', 
    license: 'MD789012',
    phone: '+91-9876543211',
    experience: 12,
    verified: true,
    availability: ['Monday', 'Wednesday', 'Friday'],
    consultationFee: 600
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@clinic.com',
    specialty: 'Dermatology',
    license: 'MD345678', 
    phone: '+91-9876543212',
    experience: 10,
    verified: true,
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    consultationFee: 400
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    specialty: 'Orthopedic',
    license: 'MD901234',
    phone: '+91-9876543213',
    experience: 18,
    verified: true,
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    consultationFee: 550
  }
];

const patients = [
  {
    name: 'John Doe',
    email: 'patient@test.com',
    age: 35,
    phone: '+91-9123456789',
    symptoms: ['fever', 'headache', 'fatigue'],
    status: 'PENDING',
    priority: 'HIGH',
    gender: 'Male',
    address: 'ITER Campus, Bhubaneswar',
    emergencyContact: '+91-9123456788',
    medicalHistory: 'No prior history',
    dataToken: 'TKN12345ABC'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    age: 28,
    phone: '+91-9123456790',
    symptoms: ['cough', 'chest pain'],
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    gender: 'Female',
    address: 'Kalinga Nagar, Bhubaneswar',
    emergencyContact: '+91-9123456791',
    medicalHistory: 'Asthma',
    dataToken: 'TKN67890DEF'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    age: 42,
    phone: '+91-9123456792',
    symptoms: ['back pain', 'muscle stiffness'],
    status: 'COMPLETED',
    priority: 'MEDIUM',
    gender: 'Male',
    address: 'Patia, Bhubaneswar',
    emergencyContact: '+91-9123456793',
    medicalHistory: 'Previous back injury',
    dataToken: 'TKN11111GHI'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    age: 31,
    phone: '+91-9123456794',
    symptoms: ['shortness of breath', 'chest tightness'],
    status: 'PENDING',
    priority: 'HIGH',
    gender: 'Female',
    address: 'Chandrasekharpur, Bhubaneswar',
    emergencyContact: '+91-9123456795',
    medicalHistory: 'Anxiety disorder',
    dataToken: 'TKN22222JKL'
  }
];

const appointments = [
  {
    patientId: 'patient-1',
    patientName: 'John Doe',
    patientToken: 'TKN12345ABC',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Sarah Johnson',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    phone: '+91-9123456789',
    status: 'SCHEDULED',
    type: 'CONSULTATION'
  },
  {
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    patientToken: 'TKN67890DEF',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Michael Chen',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:30',
    phone: '+91-9123456790',
    status: 'SCHEDULED',
    type: 'FOLLOW_UP'
  }
];

const reports = [
  {
    patientId: 'patient-1',
    patientName: 'John Doe',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Sarah Johnson',
    title: 'Initial Consultation Report',
    content: 'Patient presents with fever, headache, and fatigue. Vital signs stable. Recommended rest and medication.',
    diagnosis: 'Viral fever',
    recommendations: ['Rest for 3-5 days', 'Paracetamol 500mg TDS', 'Adequate hydration'],
    reportType: 'CONSULTATION',
    status: 'COMPLETED'
  },
  {
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Michael Chen',
    title: 'Respiratory Assessment',
    content: 'Patient experiencing persistent cough with chest discomfort. Chest X-ray ordered.',
    diagnosis: 'Upper respiratory tract infection',
    recommendations: ['Chest X-ray', 'Antibiotic course', 'Follow-up in 1 week'],
    reportType: 'DIAGNOSTIC',
    status: 'PENDING_REVIEW'
  }
];

const prescriptions = [
  {
    patientId: 'patient-1',
    patientName: 'John Doe',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Sarah Johnson',
    medicine: 'Paracetamol 500mg',
    dosage: '1 tablet twice daily',
    duration: '5 days',
    notes: 'Take after meals',
    status: 'ACTIVE',
    prescribedDate: new Date().toISOString(),
    pharmacyInstructions: 'Dispense as prescribed'
  },
  {
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Michael Chen',
    medicine: 'Azithromycin 250mg',
    dosage: '1 tablet once daily',
    duration: '3 days',
    notes: 'Complete the full course',
    status: 'PENDING',
    prescribedDate: new Date().toISOString(),
    pharmacyInstructions: 'Patient counseling required'
  }
];

const medicines = [
  {
    name: 'Paracetamol 500mg',
    category: 'Analgesic',
    manufacturer: 'Cipla',
    price: 25.50,
    stock: 500,
    description: 'Pain reliever and fever reducer',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '10 tablets'
  },
  {
    name: 'Ibuprofen 400mg',
    category: 'NSAID',
    manufacturer: 'Sun Pharma',
    price: 45.00,
    stock: 300,
    description: 'Anti-inflammatory pain reliever',
    dosageForm: 'Tablet',
    strength: '400mg',
    packSize: '10 tablets'
  },
  {
    name: 'Azithromycin 250mg',
    category: 'Antibiotic',
    manufacturer: 'Dr. Reddy\'s',
    price: 85.00,
    stock: 200,
    description: 'Broad-spectrum antibiotic',
    dosageForm: 'Tablet',
    strength: '250mg',
    packSize: '6 tablets'
  },
  {
    name: 'Omeprazole 20mg',
    category: 'PPI',
    manufacturer: 'Lupin',
    price: 65.00,
    stock: 150,
    description: 'Proton pump inhibitor for acidity',
    dosageForm: 'Capsule',
    strength: '20mg',
    packSize: '10 capsules'
  },
  {
    name: 'Metformin 500mg',
    category: 'Antidiabetic',
    manufacturer: 'Biocon',
    price: 55.00,
    stock: 400,
    description: 'Type 2 diabetes medication',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '15 tablets'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding complete Firestore database...');
    
    // Clear existing data
    console.log('🗑️ Clearing existing collections...');
    const collections = ['doctors', 'patients', 'appointments', 'reports', 'prescriptions', 'medicines'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${collectionName} collection`);
    }
    
    // Seed doctors
    console.log('👨‍⚕️ Seeding doctors...');
    for (const doctor of doctors) {
      const docRef = await db.collection('doctors').add({
        ...doctor,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added doctor: ${doctor.name} (${docRef.id})`);
    }
    
    // Seed patients
    console.log('🏥 Seeding patients...');
    for (const patient of patients) {
      const docRef = await db.collection('patients').add({
        ...patient,
        reports: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added patient: ${patient.name} (${docRef.id})`);
    }
    
    // Seed appointments
    console.log('📅 Seeding appointments...');
    for (const appointment of appointments) {
      const docRef = await db.collection('appointments').add({
        ...appointment,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added appointment: ${appointment.patientName} with ${appointment.doctorName}`);
    }
    
    // Seed reports
    console.log('📋 Seeding medical reports...');
    for (const report of reports) {
      const docRef = await db.collection('reports').add({
        ...report,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added report: ${report.title}`);
    }
    
    // Seed prescriptions
    console.log('💊 Seeding prescriptions...');
    for (const prescription of prescriptions) {
      const docRef = await db.collection('prescriptions').add({
        ...prescription,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added prescription: ${prescription.medicine} for ${prescription.patientName}`);
    }
    
    // Seed medicines
    console.log('🏪 Seeding medicine inventory...');
    for (const medicine of medicines) {
      const docRef = await db.collection('medicines').add({
        ...medicine,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added medicine: ${medicine.name}`);
    }
    
    console.log('\n🎉 COMPLETE FIRESTORE DATABASE SEEDED SUCCESSFULLY!');
    console.log('\n📊 Database Summary:');
    console.log(`   👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`   🏥 Patients: ${patients.length}`);
    console.log(`   📅 Appointments: ${appointments.length}`);
    console.log(`   📋 Reports: ${reports.length}`);
    console.log(`   💊 Prescriptions: ${prescriptions.length}`);
    console.log(`   🏪 Medicines: ${medicines.length}`);
    console.log('\n✅ All collections created with sample data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
