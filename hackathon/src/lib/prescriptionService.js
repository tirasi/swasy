// Prescription Management Service
class PrescriptionService {
  constructor() {
    this.prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
  }

  createPrescription(doctorId, patientId, medications, notes = '') {
    const prescription = {
      id: `RX_${Date.now()}`,
      doctorId,
      patientId,
      medications,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      pharmacyStatus: 'NOT_SENT',
      estimatedCost: this.calculateCost(medications)
    };

    this.prescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(this.prescriptions));

    // Send to pharmacy
    this.sendToPharmacy(prescription);

    // Notify patient
    this.notifyPatient(prescription);

    return prescription;
  }

  calculateCost(medications) {
    const medicineDatabase = {
      'Paracetamol': 50,
      'Ibuprofen': 80,
      'Amoxicillin': 120,
      'Aspirin': 40,
      'Omeprazole': 150,
      'Metformin': 100,
      'Atorvastatin': 200,
      'Lisinopril': 180
    };

    return medications.reduce((total, med) => {
      const basePrice = medicineDatabase[med.name] || 100;
      return total + (basePrice * (med.quantity || 1));
    }, 0);
  }

  sendToPharmacy(prescription) {
    const pharmacyOrder = {
      id: `PH_${Date.now()}`,
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      medications: prescription.medications,
      status: 'RECEIVED',
      estimatedCost: prescription.estimatedCost,
      estimatedTime: '30 minutes',
      pharmacyNotes: 'Order received and being processed',
      timestamp: new Date().toISOString()
    };

    const pharmacyOrders = JSON.parse(localStorage.getItem('pharmacyOrders') || '[]');
    pharmacyOrders.push(pharmacyOrder);
    localStorage.setItem('pharmacyOrders', JSON.stringify(pharmacyOrders));

    // Update prescription status
    prescription.pharmacyStatus = 'SENT';
    localStorage.setItem('prescriptions', JSON.stringify(this.prescriptions));

    // Trigger pharmacy notification
    window.dispatchEvent(new CustomEvent('newPharmacyOrder', { detail: pharmacyOrder }));
  }

  notifyPatient(prescription) {
    const notification = {
      id: `PAT_NOTIF_${Date.now()}`,
      patientId: prescription.patientId,
      type: 'PRESCRIPTION_READY',
      title: 'New Prescription Available',
      message: `Your doctor has prescribed ${prescription.medications.length} medication(s). Estimated cost: ₹${prescription.estimatedCost}`,
      timestamp: new Date().toISOString(),
      read: false,
      prescriptionId: prescription.id
    };

    const patientNotifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
    patientNotifications.unshift(notification);
    localStorage.setItem('patientNotifications', JSON.stringify(patientNotifications));

    window.dispatchEvent(new CustomEvent('newPatientNotification', { detail: notification }));
  }

  getPrescriptionsByPatient(patientId) {
    return this.prescriptions.filter(p => p.patientId === patientId);
  }

  getPrescriptionsByDoctor(doctorId) {
    return this.prescriptions.filter(p => p.doctorId === doctorId);
  }

  updatePrescriptionStatus(prescriptionId, status) {
    const prescription = this.prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      prescription.status = status;
      localStorage.setItem('prescriptions', JSON.stringify(this.prescriptions));
    }
  }
}

export const prescriptionService = new PrescriptionService();