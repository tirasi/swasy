// Prescription management service
export class PrescriptionService {
  private static instance: PrescriptionService;
  
  static getInstance(): PrescriptionService {
    if (!PrescriptionService.instance) {
      PrescriptionService.instance = new PrescriptionService();
    }
    return PrescriptionService.instance;
  }

  createPrescription(doctorId: string, patientId: string, medications: any[], notes: string) {
    const prescription = {
      id: `rx_${Date.now()}`,
      doctorId,
      patientId,
      medications,
      notes,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      estimatedCost: this.calculateCost(medications)
    };

    const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    prescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

    return prescription;
  }

  private calculateCost(medications: any[]): number {
    return medications.reduce((total, med) => {
      const baseCost = 50; // Base cost per medication
      return total + baseCost * (med.quantity || 1);
    }, 0);
  }
}

export const prescriptionService = PrescriptionService.getInstance();