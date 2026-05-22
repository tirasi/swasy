// Centralized data service — Firestore primary, localStorage fallback
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { notificationService } from './notificationService';
import { syncService } from './syncService';
import { routingService } from './routingService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

function dedupeById(arr: any[]) {
  const seen = new Set();
  return arr.filter((item: any) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function firestoreGet(col: string, filters?: { field: string; value: any }[]) {
  const ref = collection(db, col);
  const q = filters
    ? query(ref, ...filters.map((f) => where(f.field, '==', f.value)))
    : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function firestoreAdd(col: string, data: any) {
  const ref = await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
}

async function firestoreUpdate(col: string, id: string, data: any) {
  await updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() });
}

async function firestoreDelete(col: string, id: string) {
  await deleteDoc(doc(db, col, id));
}

export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) DataService.instance = new DataService();
    return DataService.instance;
  }

  private async fetchAPI(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  // ── Appointments ──────────────────────────────────────────────────────────

  async getAppointments() {
    try {
      const data = await firestoreGet('appointments');
      if (data.length > 0) {
        const deduped = dedupeById(data);
        localStorage.setItem('appointments', JSON.stringify(deduped));
        return deduped;
      }
    } catch {
      // fall through
    }
    try {
      const result = await this.fetchAPI('/appointments');
      const data = result.data || [];
      if (data.length > 0) {
        const deduped = dedupeById(data);
        localStorage.setItem('appointments', JSON.stringify(deduped));
        return deduped;
      }
    } catch {
      // fall through
    }
    return dedupeById(JSON.parse(localStorage.getItem('appointments') || '[]'));
  }

  async saveAppointments(appointments: any[]) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    window.dispatchEvent(new CustomEvent('appointmentsUpdated', { detail: appointments }));
  }

  async createAppointment(appointment: any) {
    let saved = appointment;
    try {
      saved = await firestoreAdd('appointments', appointment);
    } catch {
      try {
        const result = await this.fetchAPI('/appointments', {
          method: 'POST',
          body: JSON.stringify(appointment),
        });
        saved = result.data || appointment;
      } catch {
        // use local appointment as-is
      }
    }
    // Sync exactly once after save
    syncService.syncAppointment(saved, 'CREATE');
    this.sendAppointmentNotifications(saved, 'CREATED');
    return saved;
  }

  async updateAppointment(appointmentId: string, updates: any) {
    try {
      await firestoreUpdate('appointments', appointmentId, updates);
    } catch {
      try {
        await this.fetchAPI(`/appointments/${appointmentId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch {
        // local fallback handled below
      }
    }
    const updated = { id: appointmentId, ...updates };
    syncService.syncAppointment(updated, 'UPDATE');
    this.sendAppointmentNotifications(updated, 'UPDATED');
    return this.getAppointments();
  }

  // ── Patients ──────────────────────────────────────────────────────────────

  async getPatients() {
    try {
      const data = await firestoreGet('patients');
      // Only overwrite localStorage if Firestore actually has data
      if (data.length > 0) {
        localStorage.setItem('patients', JSON.stringify(data));
        return data;
      }
    } catch {
      // fall through
    }
    try {
      const result = await this.fetchAPI('/patients');
      const data = result.data || [];
      if (data.length > 0) {
        localStorage.setItem('patients', JSON.stringify(data));
        return data;
      }
    } catch {
      // fall through
    }
    return JSON.parse(localStorage.getItem('patients') || '[]');
  }

  async savePatients(patients: any[]) {
    localStorage.setItem('patients', JSON.stringify(patients));
    window.dispatchEvent(new CustomEvent('patientsUpdated', { detail: patients }));
    patients.forEach((patient) => {
      if (patient.status === 'PENDING' || patient.status === 'UNDER_REVIEW') {
        const key = `patient_notif_${patient.id}`;
        if (!sessionStorage.getItem(key)) {
          notificationService.addNotification({
            type: 'PATIENT_REQUEST',
            message: `New patient request: ${patient.name}`,
            patientId: patient.id,
          });
          sessionStorage.setItem(key, 'sent');
        }
      }
    });
  }

  async createPatient(patient: any) {
    try {
      const saved = await firestoreAdd('patients', patient);
      syncService.syncPatient(saved, 'CREATE');
      if (saved.symptoms?.length > 0) this.autoCreateAppointment(saved);
      return saved;
    } catch {
      try {
        const result = await this.fetchAPI('/patients', {
          method: 'POST',
          body: JSON.stringify(patient),
        });
        syncService.syncPatient(result.data, 'CREATE');
        if (result.data.symptoms?.length > 0) this.autoCreateAppointment(result.data);
        return result.data;
      } catch {
        syncService.syncPatient(patient, 'CREATE');
        if (patient.symptoms?.length > 0) this.autoCreateAppointment(patient);
        return patient;
      }
    }
  }

  async updatePatient(patientId: string, updates: any) {
    try {
      await firestoreUpdate('patients', patientId, updates);
      const patients = await this.getPatients();
      window.dispatchEvent(new CustomEvent('patientsUpdated', { detail: patients }));
      return patients;
    } catch {
      try {
        await this.fetchAPI(`/patients/${patientId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        const patients = await this.getPatients();
        window.dispatchEvent(new CustomEvent('patientsUpdated', { detail: patients }));
        return patients;
      } catch {
        const patients = JSON.parse(localStorage.getItem('patients') || '[]');
        const updated = patients.map((p: any) =>
          p.id === patientId ? { ...p, ...updates } : p
        );
        await this.savePatients(updated);
        return updated;
      }
    }
  }

  async removePatient(patientId: string) {
    try {
      await firestoreDelete('patients', patientId);
    } catch {
      // local fallback below
    }
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const updated = patients.filter((p: any) => p.id !== patientId);
    await this.savePatients(updated);
    return updated;
  }

  // ── Doctor assignments ────────────────────────────────────────────────────

  getAssignedDoctors() {
    return JSON.parse(localStorage.getItem('assignedDoctors') || '{}');
  }

  saveAssignedDoctors(assignments: any) {
    localStorage.setItem('assignedDoctors', JSON.stringify(assignments));
    window.dispatchEvent(new CustomEvent('doctorAssignmentsUpdated', { detail: assignments }));
  }

  assignDoctor(patientId: string, doctorName: string) {
    const assignments = this.getAssignedDoctors();
    assignments[patientId] = doctorName;
    this.saveAssignedDoctors(assignments);
    return assignments;
  }

  // ── Prescriptions ─────────────────────────────────────────────────────────

  getPrescriptions() {
    return JSON.parse(localStorage.getItem('prescriptions') || '[]');
  }

  savePrescriptions(prescriptions: any[]) {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    window.dispatchEvent(new CustomEvent('prescriptionsUpdated', { detail: prescriptions }));
  }

  async addPrescription(prescription: any) {
    try {
      await firestoreAdd('prescriptions', prescription);
    } catch {
      // local fallback
    }
    syncService.syncPrescription(prescription, 'CREATE');
    this.sendPrescriptionNotifications(prescription);
    return this.getPrescriptions();
  }

  // ── Emergencies ───────────────────────────────────────────────────────────

  getEmergencies() {
    return JSON.parse(localStorage.getItem('emergencies') || '[]');
  }

  saveEmergencies(emergencies: any[]) {
    localStorage.setItem('emergencies', JSON.stringify(emergencies));
    window.dispatchEvent(new CustomEvent('emergenciesUpdated', { detail: emergencies }));
  }

  addEmergency(emergency: any) {
    const emergencies = this.getEmergencies();
    emergencies.push(emergency);
    this.saveEmergencies(emergencies);
    return emergencies;
  }

  // ── Health Reports (patient portal) ───────────────────────────────────────

  async saveHealthReport(report: any) {
    try {
      const saved = await firestoreAdd('healthReports', report);
      // also keep local copy
      const existing = JSON.parse(localStorage.getItem('healthReports') || '[]');
      existing.push(saved);
      localStorage.setItem('healthReports', JSON.stringify(existing));
      return saved;
    } catch {
      const existing = JSON.parse(localStorage.getItem('healthReports') || '[]');
      existing.push(report);
      localStorage.setItem('healthReports', JSON.stringify(existing));
      return report;
    }
  }

  async getHealthReports(patientId: string) {
    try {
      return await firestoreGet('healthReports', [{ field: 'patientId', value: patientId }]);
    } catch {
      return JSON.parse(localStorage.getItem('healthReports') || '[]').filter(
        (r: any) => r.patientId === patientId
      );
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async autoCreateAppointment(patient: any) {
    try {
      const appointment = routingService.createIntelligentAppointment(
        patient,
        patient.symptoms || [],
        patient.priority
      );
      await this.createAppointment(appointment);
      this.sendAppointmentNotifications(appointment, 'CREATED');
      syncService.sendNotification({
        id: `notif_${Date.now()}_token`,
        type: 'APPOINTMENT_TOKEN',
        title: 'Appointment Token Generated',
        message: `Your appointment token is ${appointment.tokenNumber}. Queue position: ${appointment.queuePosition}.`,
        patientId: patient.id,
        appointmentId: appointment.id,
        tokenNumber: appointment.tokenNumber,
        queuePosition: appointment.queuePosition,
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to auto-create appointment:', error);
    }
  }

  private sendAppointmentNotifications(appointment: any, action: string) {
    syncService.sendNotification({
      id: `notif_${Date.now()}_doctor`,
      type: 'NEW_APPOINTMENT',
      title: `New Appointment ${action}`,
      message: `Patient: ${appointment.patientName} (${appointment.patientAge}y) - ${appointment.symptoms?.join(', ')}. Token: ${appointment.tokenNumber}`,
      targetRole: 'doctor',
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      tokenNumber: appointment.tokenNumber,
      specialty: appointment.specialty,
      priority: appointment.priority || 'MEDIUM',
      timestamp: new Date().toISOString(),
    });
    syncService.sendNotification({
      id: `notif_${Date.now()}_patient`,
      type: 'APPOINTMENT_CONFIRMED',
      title: `Appointment ${action} - Token Generated`,
      message: `Your appointment with ${appointment.assignedSpecialist} is confirmed. Token: ${appointment.tokenNumber}, Queue: ${appointment.queuePosition}`,
      targetRole: 'patient',
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      tokenNumber: appointment.tokenNumber,
      queuePosition: appointment.queuePosition,
      priority: 'HIGH',
      timestamp: new Date().toISOString(),
    });
  }

  private sendPrescriptionNotifications(prescription: any) {
    syncService.sendNotification({
      id: `notif_${Date.now()}_pharmacy`,
      type: 'NEW_PRESCRIPTION',
      title: 'New Prescription Received',
      message: `New prescription for ${prescription.patientName} - ${prescription.medicine}`,
      targetRole: 'pharmacy',
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      priority: 'MEDIUM',
      timestamp: new Date().toISOString(),
    });
    syncService.sendNotification({
      id: `notif_${Date.now()}_patient_rx`,
      type: 'PRESCRIPTION_READY',
      title: 'Prescription Issued',
      message: `Your prescription for ${prescription.medicine} is ready for pickup`,
      targetRole: 'patient',
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      priority: 'MEDIUM',
      timestamp: new Date().toISOString(),
    });
  }
}

export const dataService = DataService.getInstance();
