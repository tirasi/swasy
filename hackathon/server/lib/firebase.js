const admin = require('firebase-admin');

let db;

function initializeFirebase() {
  try {
    // Initialize with service account or default credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.GCP_PROJECT_ID
      });
    } else {
      // Use default credentials in GCP environment
      admin.initializeApp({
        projectId: process.env.GCP_PROJECT_ID
      });
    }
    
    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
}

function getFirestore() {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return db;
}

function isConnected() {
  return db !== null && db !== undefined;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  isConnected,
  admin
};
