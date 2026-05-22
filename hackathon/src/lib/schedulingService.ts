// Intelligent Scheduling Service with Doctor Availability
import { intelligentRouting } from './intelligentRouting';

interface DoctorSchedule {
  doctorId: string;
  doctorName: string;
  department: string;
  specialty: string;
  availableSlots: TimeSlot[];
  rating: number;
  experience: number;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  slotId: string;
}

export class SchedulingService {
  private static instance: SchedulingService;

  static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService();
    }
    return SchedulingService.instance;
  }

  // Get all doctors with their schedules
  getDoctorSchedules(): DoctorSchedule[] {
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

    return [
      {
        doctorId: 'dr1',
        doctorName: 'Dr. Rajesh Kumar',
        department: 'Cardiology',
        specialty: 'Heart Specialist',
        rating: 4.8,
        experience: 15,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.7)
      },
      {
        doctorId: 'dr2',
        doctorName: 'Dr. Priya Sharma',
        department: 'Dermatology',
        specialty: 'Skin Specialist',
        rating: 4.9,
        experience: 12,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.8)
      },
      {
        doctorId: 'dr3',
        doctorName: 'Dr. Vikram Rao',
        department: 'Neurology',
        specialty: 'Brain & Nerve Specialist',
        rating: 4.7,
        experience: 18,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.6)
      },
      {
        doctorId: 'dr4',
        doctorName: 'Dr. Amit Singh',
        department: 'Orthopedics',
        specialty: 'Bone & Joint Specialist',
        rating: 4.6,
        experience: 10,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.75)
      },
      {
        doctorId: 'dr5',
        doctorName: 'Dr. Sunita Patel',
        department: 'Gastroenterology',
        specialty: 'Stomach & Digestive Specialist',
        rating: 4.8,
        experience: 14,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.65)
      },
      {
        doctorId: 'dr6',
        doctorName: 'Dr. Ravi Gupta',
        department: 'ENT',
        specialty: 'Ear, Nose & Throat Specialist',
        rating: 4.5,
        experience: 11,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.8)
      },
      {
        doctorId: 'dr7',
        doctorName: 'Dr. Meera Joshi',
        department: 'Ophthalmology',
        specialty: 'Eye Specialist',
        rating: 4.9,
        experience: 16,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.7)
      },
      {
        doctorId: 'dr8',
        doctorName: 'Dr. Kavita Nair',
        department: 'General Medicine',
        specialty: 'General Physician',
        rating: 4.7,
        experience: 13,
        availableSlots: this.generateSlots(next7Days, timeSlots, 0.85)
      }
    ];
  }

  // Generate time slots with random availability
  private generateSlots(dates: string[], times: string[], availabilityRate: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    dates.forEach(date => {
      times.forEach(time => {
        slots.push({
          date,
          time,
          available: Math.random() < availabilityRate,
          slotId: `${date}_${time}`
        });
      });
    });
    return slots;
  }

  // Get doctors by department
  getDoctorsByDepartment(department: string): DoctorSchedule[] {
    return this.getDoctorSchedules().filter(d => d.department === department);
  }

  // Get available slots for a specific doctor
  getAvailableSlots(doctorId: string): TimeSlot[] {
    const doctor = this.getDoctorSchedules().find(d => d.doctorId === doctorId);
    return doctor?.availableSlots.filter(s => s.available) || [];
  }

  // AI-powered smart scheduling
  async smartSchedule(symptoms: string, preferredDate?: string): Promise<{
    recommendedDoctor: DoctorSchedule;
    bestSlot: TimeSlot;
    alternativeSlots: TimeSlot[];
    reasoning: string;
  }> {
    // Route to specialist
    const routing = await intelligentRouting.routeToSpecialist(symptoms);
    
    // Get doctors in that department
    const doctors = this.getDoctorsByDepartment(routing.department);
    
    if (doctors.length === 0) {
      throw new Error('No doctors available in this department');
    }

    // Find doctor with best availability
    let bestDoctor = doctors[0];
    let maxAvailableSlots = 0;

    doctors.forEach(doctor => {
      const availableCount = doctor.availableSlots.filter(s => s.available).length;
      if (availableCount > maxAvailableSlots) {
        maxAvailableSlots = availableCount;
        bestDoctor = doctor;
      }
    });

    // Get available slots
    const availableSlots = bestDoctor.availableSlots.filter(s => s.available);
    
    if (availableSlots.length === 0) {
      throw new Error('No available slots for this doctor');
    }

    // Find best slot (earliest available or preferred date)
    let bestSlot = availableSlots[0];
    if (preferredDate) {
      const preferredSlots = availableSlots.filter(s => s.date === preferredDate);
      if (preferredSlots.length > 0) {
        bestSlot = preferredSlots[0];
      }
    }

    // Get alternative slots (next 3 available)
    const alternativeSlots = availableSlots.slice(1, 4);

    return {
      recommendedDoctor: bestDoctor,
      bestSlot,
      alternativeSlots,
      reasoning: `Based on your symptoms (${routing.reasoning}), ${bestDoctor.doctorName} is recommended. ${bestDoctor.experience} years experience, ${bestDoctor.rating}★ rating.`
    };
  }

  // Book appointment
  async bookAppointment(
    patientId: string,
    patientName: string,
    doctorId: string,
    slotId: string
  ): Promise<{ success: boolean; appointmentId: string; message: string }> {
    const doctors = this.getDoctorSchedules();
    const doctor = doctors.find(d => d.doctorId === doctorId);
    
    if (!doctor) {
      return { success: false, appointmentId: '', message: 'Doctor not found' };
    }

    const slot = doctor.availableSlots.find(s => s.slotId === slotId);
    
    if (!slot || !slot.available) {
      return { success: false, appointmentId: '', message: 'Slot not available' };
    }

    // Mark slot as booked
    slot.available = false;

    const appointmentId = `APT_${Date.now()}`;
    
    // Store appointment
    const appointment = {
      id: appointmentId,
      patientId,
      patientName,
      doctorId: doctor.doctorId,
      doctorName: doctor.doctorName,
      department: doctor.department,
      date: slot.date,
      time: slot.time,
      status: 'SCHEDULED',
      bookedAt: new Date().toISOString()
    };

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    return {
      success: true,
      appointmentId,
      message: `Appointment booked with ${doctor.doctorName} on ${slot.date} at ${slot.time}`
    };
  }

  // Voice-guided scheduling
  async voiceGuidedScheduling(symptoms: string, language: string = 'hi-IN'): Promise<any> {
    const messages = {
      'hi-IN': {
        analyzing: 'आपके लक्षणों का विश्लेषण किया जा रहा है...',
        finding: 'सबसे अच्छे डॉक्टर और समय खोजा जा रहा है...',
        found: 'मिल गया! आपके लिए सबसे अच्छा समय',
        confirm: 'क्या आप इस समय पर अपॉइंटमेंट बुक करना चाहते हैं?'
      },
      'en-US': {
        analyzing: 'Analyzing your symptoms...',
        finding: 'Finding the best doctor and time slot...',
        found: 'Found! Best time for you',
        confirm: 'Would you like to book this appointment?'
      }
    };

    const msg = messages[language] || messages['en-US'];

    // Speak progress
    intelligentRouting.speak(msg.analyzing, language);
    await this.delay(1000);

    const schedule = await this.smartSchedule(symptoms);

    intelligentRouting.speak(msg.finding, language);
    await this.delay(1000);

    const announcement = language === 'hi-IN'
      ? `${schedule.recommendedDoctor.doctorName}, ${schedule.recommendedDoctor.department} विभाग। तारीख: ${schedule.bestSlot.date}, समय: ${schedule.bestSlot.time}`
      : `${schedule.recommendedDoctor.doctorName}, ${schedule.recommendedDoctor.department} department. Date: ${schedule.bestSlot.date}, Time: ${schedule.bestSlot.time}`;

    intelligentRouting.speak(msg.found + '. ' + announcement, language);

    return schedule;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const schedulingService = SchedulingService.getInstance();
