import { gcpService } from './gcpService';
import { secureDB } from './secureDatabase';

class DatabaseService {
  async initialize(): Promise<void> {
    try {
      await gcpService.healthCheck();
      console.log('✅ Using GCP Firestore for data persistence');
    } catch (error) {
      console.warn('⚠️ GCP unavailable, using local storage fallback');
    }
  }

  async getPatients(status?: string, doctorId?: string) {
    try {
      const filters: any = {};
      if (status) filters.status = status;
      if (doctorId) filters.doctorId = doctorId;
      const result = await gcpService.getPatients(filters);
      return result.data || [];
    } catch {
      return secureDB.getPatients(status, doctorId);
    }
  }

  async addPatient(patient: any) {
    try {
      const result = await gcpService.createPatient(patient);
      return result.data;
    } catch {
      return secureDB.addPatient(patient);
    }
  }

  async updatePatient(patientId: string, updates: any) {
    try {
      const result = await gcpService.updatePatient(patientId, updates);
      return result.data;
    } catch {
      return secureDB.updatePatient(patientId, updates);
    }
  }

  async getReports() {
    return secureDB.getReports();
  }

  async addReport(report: any) {
    return secureDB.addReport(report);
  }

  async updateReport(reportId: string, updates: any) {
    return secureDB.updateReport(reportId, updates);
  }

  async getLockedReports() {
    return secureDB.getLockedReports();
  }

  async createPrescription(prescription: any) {
    return secureDB.createPrescription(prescription);
  }

  async getPrescriptions(pharmacyId?: string) {
    return secureDB.getPrescriptions(pharmacyId);
  }

  async updatePrescriptionStatus(prescriptionId: string, status: string) {
    return secureDB.updatePrescriptionStatus(prescriptionId, status);
  }

  getDoctors() {
    return secureDB.getDoctors();
  }

  getMedicines() {
    return secureDB.getMedicines();
  }

  searchMedicines(query: string, category?: string) {
    return secureDB.searchMedicines(query, category);
  }

  getMedicineCategories() {
    return secureDB.getMedicineCategories();
  }

  generateEBill(prescriptionId: string, pharmacyId: string) {
    return secureDB.generateEBill(prescriptionId, pharmacyId);
  }
}

export const dbService = new DatabaseService();