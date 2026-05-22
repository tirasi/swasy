// Real-time synchronization service for cross-portal communication
function dedupeById(arr: any[]) {
  const seen = new Set();
  return arr.filter((item: any) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export class SyncService {
  private static instance: SyncService;
  private eventListeners: Map<string, Function[]> = new Map();
  
  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Subscribe to events
  subscribe(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)?.push(callback);
  }

  // Unsubscribe from events
  unsubscribe(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit events
  private emit(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback({ detail: data }));
    }
  }

  // Sync appointment across all portals
  syncAppointment(appointment: any, action: 'CREATE' | 'UPDATE' | 'DELETE') {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    switch (action) {
      case 'CREATE': {
        // Dedup — never add if same id already exists
        const exists = appointments.find((a: any) => a.id === appointment.id);
        if (!exists) appointments.push(appointment);
        break;
      }
      case 'UPDATE': {
        const idx = appointments.findIndex((a: any) => a.id === appointment.id);
        if (idx !== -1) appointments[idx] = { ...appointments[idx], ...appointment };
        break;
      }
      case 'DELETE': {
        const idx = appointments.findIndex((a: any) => a.id === appointment.id);
        if (idx !== -1) appointments.splice(idx, 1);
        break;
      }
    }
    
    localStorage.setItem('appointments', JSON.stringify(dedupeById(appointments)));
    window.dispatchEvent(new CustomEvent('appointmentsUpdated', { detail: dedupeById(appointments) }));
    this.emit('appointmentSync', { appointment, action });
  }

  // Sync patient across all portals
  syncPatient(patient: any, action: 'CREATE' | 'UPDATE' | 'DELETE') {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    
    switch (action) {
      case 'CREATE':
        patients.push(patient);
        break;
      case 'UPDATE':
        const updateIndex = patients.findIndex(p => p.id === patient.id);
        if (updateIndex !== -1) {
          patients[updateIndex] = { ...patients[updateIndex], ...patient };
        }
        break;
      case 'DELETE':
        const deleteIndex = patients.findIndex(p => p.id === patient.id);
        if (deleteIndex !== -1) {
          patients.splice(deleteIndex, 1);
        }
        break;
    }
    
    localStorage.setItem('patients', JSON.stringify(patients));
    window.dispatchEvent(new CustomEvent('patientsUpdated', { detail: patients }));
  }

  // Sync prescription across all portals
  syncPrescription(prescription: any, action: 'CREATE' | 'UPDATE' | 'DELETE') {
    const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    
    switch (action) {
      case 'CREATE':
        prescriptions.push(prescription);
        break;
      case 'UPDATE':
        const updateIndex = prescriptions.findIndex(p => p.id === prescription.id);
        if (updateIndex !== -1) {
          prescriptions[updateIndex] = { ...prescriptions[updateIndex], ...prescription };
        }
        break;
      case 'DELETE':
        const deleteIndex = prescriptions.findIndex(p => p.id === prescription.id);
        if (deleteIndex !== -1) {
          prescriptions.splice(deleteIndex, 1);
        }
        break;
    }
    
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    window.dispatchEvent(new CustomEvent('prescriptionsUpdated', { detail: prescriptions }));
  }

  // Send notification to specific portal/role
  sendNotification(notification: any) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Dispatch to specific portal based on target role
    if (notification.targetRole === 'doctor') {
      window.dispatchEvent(new CustomEvent('doctorNotification', { detail: notification }));
    } else if (notification.targetRole === 'patient') {
      window.dispatchEvent(new CustomEvent('patientNotification', { detail: notification }));
    } else if (notification.targetRole === 'pharmacy') {
      window.dispatchEvent(new CustomEvent('pharmacyNotification', { detail: notification }));
    }
    
    // General notification event
    window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    this.emit('newNotification', notification);
  }
}

export const syncService = SyncService.getInstance();