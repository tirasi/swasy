const { getFirestore } = require('../lib/firebase');

class Doctor {
  static collection = 'doctors';

  static async create(data) {
    const db = getFirestore();
    const docRef = await db.collection(this.collection).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }

  static async findOne(query) {
    const db = getFirestore();
    const field = Object.keys(query)[0];
    const value = query[field];
    
    const snapshot = await db.collection(this.collection)
      .where(field, '==', value)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
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
      ref = ref.where(field, '==', value);
    });
    
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByIdAndUpdate(id, updates) {
    const db = getFirestore();
    await db.collection(this.collection).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return this.findById(id);
  }

  static async deleteMany(query = {}) {
    const db = getFirestore();
    const docs = await this.find(query);
    const batch = db.batch();
    
    docs.forEach(doc => {
      batch.delete(db.collection(this.collection).doc(doc.id));
    });
    
    await batch.commit();
    return { deletedCount: docs.length };
  }
}

module.exports = Doctor;
