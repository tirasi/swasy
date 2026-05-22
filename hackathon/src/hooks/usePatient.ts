import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authService } from '@/lib/auth';

const DEFAULT_PATIENT = {
  id: '1',
  name: 'Pree Om',
  age: 28,
  status: 'ACTIVE',
  symptoms: ['chest pain', 'shortness of breath'],
  phone: '+91-9853224443',
  assignedDoctor: 'd1',
  updatedAt: new Date().toISOString(),
  dataToken: 'TOKEN123456',
  reports: [],
};

function seedLocalIfEmpty(userId: string, name: string) {
  const existing = JSON.parse(localStorage.getItem('patients') || '[]');
  if (existing.length === 0) {
    const seed = [{ ...DEFAULT_PATIENT, id: userId, name }];
    localStorage.setItem('patients', JSON.stringify(seed));
    return seed;
  }
  return existing;
}

function getFromLocal(userId: string) {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  return patients.find((p: any) => p.id === userId) || patients[0] || null;
}

function mergeDefaults(p: any) {
  return {
    age: DEFAULT_PATIENT.age,
    status: DEFAULT_PATIENT.status,
    symptoms: DEFAULT_PATIENT.symptoms,
    dataToken: DEFAULT_PATIENT.dataToken,
    ...p,
  };
}

export function usePatient() {
  const user = authService.getCurrentUser();
  const userId = user?.id || '1';
  const userName = user?.email?.split('@')[0] || DEFAULT_PATIENT.name;

  // Seed + load synchronously so UI never shows blank
  const [patient, setPatient] = useState<any>(() => {
    const patients = seedLocalIfEmpty(userId, userName);
    const found = patients.find((p: any) => p.id === userId) || patients[0] || DEFAULT_PATIENT;
    return mergeDefaults(found);
  });

  useEffect(() => {
    // Listen for profile updates from settings page
    const onProfileUpdated = (e: any) => {
      setPatient((prev: any) => mergeDefaults({ ...prev, ...e.detail }));
      // Also persist to localStorage
      const patients = JSON.parse(localStorage.getItem('patients') || '[]');
      const idx = patients.findIndex((p: any) => p.id === userId);
      if (idx !== -1) {
        patients[idx] = { ...patients[idx], ...e.detail };
        localStorage.setItem('patients', JSON.stringify(patients));
      }
    };
    window.addEventListener('profileUpdated', onProfileUpdated);

    // Firestore live sync
    let unsubFirestore: (() => void) | null = null;
    try {
      const q = query(collection(db, 'patients'), where('id', '==', userId));
      unsubFirestore = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const doc = snap.docs[0];
            const data = mergeDefaults({ id: doc.id, ...doc.data() });
            setPatient(data);
            // Keep localStorage in sync
            const patients = JSON.parse(localStorage.getItem('patients') || '[]');
            const idx = patients.findIndex((p: any) => p.id === userId);
            if (idx !== -1) patients[idx] = data;
            else patients.push(data);
            localStorage.setItem('patients', JSON.stringify(patients));
          }
        },
        () => {
          // Firestore unavailable — stay on localStorage data, no crash
        }
      );
    } catch {
      // Firebase not configured — localStorage only
    }

    return () => {
      window.removeEventListener('profileUpdated', onProfileUpdated);
      unsubFirestore?.();
    };
  }, [userId]);

  return patient;
}
