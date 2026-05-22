const { getFirestore } = require('../lib/firebase');

class Patient {
  static collection = 'patients';

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
      if (typeof value === 'object' && value.$regex) {
        // Firestore doesn't support regex, use startsWith for basic search
        ref = ref.where(field, '>=', value.$regex).where(field, '<=', value.$regex + '\uf8ff');
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

  static async save(data) {
    if (data.id) {
      return this.findByIdAndUpdate(data.id, data, { new: true });
    }
    return this.create(data);
  }
}

module.exports = Patient;
