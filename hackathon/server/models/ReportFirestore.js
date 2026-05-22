const { getFirestore } = require('../lib/firebase');

class Report {
  static collection = 'reports';

  static async create(data) {
    const db = getFirestore();
    const docRef = await db.collection(this.collection).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }

  static async findById(id) {
    const db = getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();
    
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async find(query = {}) {
    const db = getFirestore();
    let ref = db.collection(this.collection);
    
    Object.entries(query).forEach(([field, value]) => {
      if (typeof value === 'object' && value.$ne) {
        // Skip $ne queries for now
      } else {
        ref = ref.where(field, '==', value);
      }
    });
    
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    const db = getFirestore();
    await db.collection(this.collection).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    if (options.new) {
      return this.findById(id);
    }
    return { id, ...updates };
  }
}

module.exports = Report;
