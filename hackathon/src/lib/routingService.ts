// Intelligent routing service for appointments and specialist assignment
export class RoutingService {
  private static instance: RoutingService;
  
  static getInstance(): RoutingService {
    if (!RoutingService.instance) {
      RoutingService.instance = new RoutingService();
    }
    return RoutingService.instance;
  }

  // Create intelligent appointment based on symptoms and priority
  createIntelligentAppointment(patient: any, symptoms: string[], priority: string = 'MEDIUM') {
    const routing = this.routeToSpecialist(symptoms, patient);
    const tokenNumber = this.generateTokenNumber();
    const queuePosition = this.calculateQueuePosition(routing.department, priority);
    const suggestedTimes = this.getAISuggestedTimes(routing.department, priority, symptoms);
    
    return {
      id: `APT_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age || 'Unknown',
      patientPhone: patient.phone,
      symptoms: symptoms,
      assignedSpecialist: routing.name,
      specialty: routing.specialty,
      department: routing.department,
      tokenNumber: tokenNumber,
      queuePosition: queuePosition,
      priority: routing.priority || priority,
      status: 'SCHEDULED',
      date: new Date().toISOString().split('T')[0],
      time: suggestedTimes[0] === 'IMMEDIATE' ? 'IMMEDIATE' : (suggestedTimes[0] || this.getNextAvailableTime(routing.department)),
      createdAt: new Date().toISOString(),
      estimatedWaitTime: this.calculateWaitTime(queuePosition, priority),
      routing: {
        confidence: routing.confidence,
        reasoning: routing.reasoning,
        suggestedTimes: suggestedTimes
      }
    };
  }

  // Route patient to appropriate specialist based on symptoms
  routeToSpecialist(symptoms: string[], patientData?: any) {
    const symptomsText = symptoms.join(' ').toLowerCase();
    let specialist, priority = 'MEDIUM', confidence = 0.8;
    let reasoning = '';
    
    // Cardiology - High priority conditions
    if (this.matchesKeywords(symptomsText, ['chest pain', 'heart', 'cardiac', 'palpitation', 'shortness of breath'])) {
      specialist = {
        name: 'Dr. Rajesh Kumar',
        specialty: 'Cardiologist',
        department: 'Cardiology'
      };
      priority = 'HIGH';
      confidence = 0.95;
      reasoning = 'Cardiac symptoms detected. Immediate cardiology consultation recommended for chest pain and breathing issues.';
    }
    // Dermatology
    else if (this.matchesKeywords(symptomsText, ['skin', 'rash', 'itch', 'acne', 'dermat'])) {
      specialist = {
        name: 'Dr. Priya Sharma',
        specialty: 'Dermatologist', 
        department: 'Dermatology'
      };
      reasoning = 'Skin-related symptoms identified. Dermatology consultation recommended.';
    }
    // Neurology
    else if (this.matchesKeywords(symptomsText, ['headache', 'migraine', 'seizure', 'neurolog', 'dizzy'])) {
      specialist = {
        name: 'Dr. Vikram Rao',
        specialty: 'Neurologist',
        department: 'Neurology'
      };
      priority = this.matchesKeywords(symptomsText, ['severe', 'seizure']) ? 'HIGH' : 'MEDIUM';
      reasoning = 'Neurological symptoms detected. Specialist evaluation recommended.';
    }
    // Orthopedics
    else if (this.matchesKeywords(symptomsText, ['bone', 'joint', 'back pain', 'fracture', 'orthoped'])) {
      specialist = {
        name: 'Dr. Amit Singh',
        specialty: 'Orthopedic Surgeon',
        department: 'Orthopedics'
      };
      reasoning = 'Musculoskeletal symptoms identified. Orthopedic consultation recommended.';
    }
    // ENT
    else if (this.matchesKeywords(symptomsText, ['ear', 'nose', 'throat', 'hearing', 'sinus'])) {
      specialist = {
        name: 'Dr. Ravi Gupta',
        specialty: 'ENT Specialist',
        department: 'ENT'
      };
      reasoning = 'ENT symptoms detected. Specialist consultation recommended.';
    }
    // Default to General Medicine
    else {
      specialist = {
        name: 'Dr. Kavita Nair',
        specialty: 'General Physician',
        department: 'General Medicine'
      };
      reasoning = 'General symptoms. Primary care physician consultation recommended.';
    }

    return {
      ...specialist,
      priority,
      confidence,
      reasoning
    };
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private generateTokenNumber(): string {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sun Mon Tue Wed Thu Fri Sat
    const today = new Date();
    const dayLetter = days[today.getDay()];
    const dateKey = today.toISOString().split('T')[0]; // e.g. "2025-07-14"

    // Load per-day counter from localStorage
    const counters = JSON.parse(localStorage.getItem('tokenCounters') || '{}');
    const current = counters[dateKey] || 0;
    const next = current + 1;
    counters[dateKey] = next;
    localStorage.setItem('tokenCounters', JSON.stringify(counters));

    return `${dayLetter}${next.toString().padStart(3, '0')}`;
  }

  private calculateQueuePosition(department: string, priority: string): number {
    const dateKey = new Date().toISOString().split('T')[0];
    const counters = JSON.parse(localStorage.getItem('tokenCounters') || '{}');
    // Queue position equals the current token count for today (already incremented)
    const pos = counters[dateKey] || 1;
    // HIGH priority gets bumped to front half, LOW to back
    if (priority === 'HIGH') return Math.max(1, Math.floor(pos / 2));
    if (priority === 'LOW') return pos + 2;
    return pos;
  }

  // AI-suggested optimal appointment times
  getAISuggestedTimes(department: string, priority: string, symptoms: string[]): string[] {
    const now = new Date();
    const currentHour = now.getHours();
    const symptomsText = symptoms.join(' ').toLowerCase();
    
    // Emergency/High priority - immediate slots
    if (priority === 'HIGH' || priority === 'CRITICAL') {
      if (this.matchesKeywords(symptomsText, ['chest pain', 'shortness of breath', 'severe'])) {
        return ['IMMEDIATE', 'Within 30 minutes', 'Within 1 hour'];
      }
      return ['Within 2 hours', 'Within 4 hours', 'Same day'];
    }
    
    // Department-specific optimal times
    const departmentSchedules = {
      'Cardiology': ['09:00', '10:30', '14:00', '15:30'],
      'Dermatology': ['10:00', '11:30', '14:30', '16:00'],
      'Neurology': ['09:30', '11:00', '14:00', '15:00'],
      'Orthopedics': ['08:30', '10:00', '13:30', '15:30'],
      'ENT': ['09:00', '10:30', '15:00', '16:30'],
      'General Medicine': ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00']
    };
    
    const availableSlots = departmentSchedules[department] || departmentSchedules['General Medicine'];
    
    // Filter slots based on current time
    const futureSlots = availableSlots.filter(slot => {
      const slotHour = parseInt(slot.split(':')[0]);
      return slotHour > currentHour;
    });
    
    // If no slots today, suggest tomorrow's slots
    if (futureSlots.length === 0) {
      return availableSlots.map(slot => `Tomorrow ${slot}`);
    }
    
    return futureSlots.slice(0, 3); // Return top 3 suggestions
  }

  private calculateWaitTime(queuePosition: number, priority: string): string {
    const baseTimePerPatient = 15; // minutes
    const priorityMultiplier = priority === 'HIGH' ? 0.5 : priority === 'LOW' ? 1.2 : 1;
    
    const totalMinutes = Math.floor(queuePosition * baseTimePerPatient * priorityMultiplier);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private getNextAvailableTime(department: string): string {
    // Simulate next available time slots
    const currentHour = new Date().getHours();
    const availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    // Find next available slot after current time
    const nextSlot = availableSlots.find(slot => {
      const slotHour = parseInt(slot.split(':')[0]);
      return slotHour > currentHour;
    });
    
    return nextSlot || '09:00'; // Default to next day 9 AM
  }
}

export const routingService = RoutingService.getInstance();