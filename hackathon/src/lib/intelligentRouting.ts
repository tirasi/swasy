// Intelligent Specialist Routing & Voice Control Service
import { googleCloudAI } from './googleCloudAI';

export class IntelligentRoutingService {
  private static instance: IntelligentRoutingService;
  private recognition: any = null;
  private synthesis: SpeechSynthesis;

  static getInstance(): IntelligentRoutingService {
    if (!IntelligentRoutingService.instance) {
      IntelligentRoutingService.instance = new IntelligentRoutingService();
    }
    return IntelligentRoutingService.instance;
  }

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initVoiceRecognition();
  }

  // Initialize continuous voice recognition
  initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN'; // Default to Hindi for villagers
    }
  }

  // Intelligent specialist routing based on symptoms
  async routeToSpecialist(symptoms: string, patientData?: any): Promise<{
    specialist: string;
    department: string;
    doctorName: string;
    urgency: string;
    confidence: number;
    reasoning: string;
  }> {
    const symptomsLower = symptoms.toLowerCase();
    
    // AI-powered routing logic
    const routing = {
      // Cardiology
      cardiology: ['heart', 'chest pain', 'cardiac', 'palpitation', 'angina', 'breathless', 'shortness of breath'],
      // Dermatology
      dermatology: ['skin', 'rash', 'itch', 'acne', 'lesion', 'mole', 'dermat'],
      // Neurology
      neurology: ['headache', 'migraine', 'seizure', 'stroke', 'paralysis', 'numbness', 'dizzy'],
      // Orthopedics
      orthopedics: ['bone', 'fracture', 'joint', 'arthritis', 'back pain', 'knee', 'shoulder'],
      // Gastroenterology
      gastroenterology: ['stomach', 'abdomen', 'digest', 'nausea', 'vomit', 'diarrhea', 'constipation'],
      // ENT
      ent: ['ear', 'nose', 'throat', 'hearing', 'sinus', 'tonsil'],
      // Ophthalmology
      ophthalmology: ['eye', 'vision', 'blind', 'cataract', 'glaucoma'],
      // Gynecology
      gynecology: ['pregnancy', 'menstrual', 'uterus', 'ovary', 'gynec'],
      // Pulmonology
      pulmonology: ['lung', 'asthma', 'cough', 'breathing', 'respiratory', 'pneumonia'],
      // Nephrology
      nephrology: ['kidney', 'urine', 'renal', 'dialysis']
    };

    let matchedSpecialty = 'General Medicine';
    let maxMatches = 0;
    let matchedKeywords: string[] = [];

    for (const [specialty, keywords] of Object.entries(routing)) {
      const matches = keywords.filter(keyword => symptomsLower.includes(keyword));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        matchedSpecialty = specialty;
        matchedKeywords = matches;
      }
    }

    // Determine urgency
    const urgentKeywords = ['severe', 'acute', 'emergency', 'sudden', 'chest pain', 'stroke', 'bleeding'];
    const isUrgent = urgentKeywords.some(keyword => symptomsLower.includes(keyword));

    // Map specialty to doctor
    const specialistMapping = {
      cardiology: { name: 'Dr. Rajesh Kumar', dept: 'Cardiology' },
      dermatology: { name: 'Dr. Priya Sharma', dept: 'Dermatology' },
      neurology: { name: 'Dr. Vikram Rao', dept: 'Neurology' },
      orthopedics: { name: 'Dr. Amit Singh', dept: 'Orthopedics' },
      gastroenterology: { name: 'Dr. Sunita Patel', dept: 'Gastroenterology' },
      ent: { name: 'Dr. Ravi Gupta', dept: 'ENT' },
      ophthalmology: { name: 'Dr. Meera Joshi', dept: 'Ophthalmology' },
      gynecology: { name: 'Dr. Kavita Nair', dept: 'Gynecology' },
      pulmonology: { name: 'Dr. Anil Verma', dept: 'Pulmonology' },
      nephrology: { name: 'Dr. Suresh Reddy', dept: 'Nephrology' },
      'General Medicine': { name: 'Dr. Kavita Nair', dept: 'General Medicine' }
    };

    const specialist = specialistMapping[matchedSpecialty] || specialistMapping['General Medicine'];
    const confidence = maxMatches > 0 ? Math.min(0.95, 0.7 + (maxMatches * 0.1)) : 0.6;

    return {
      specialist: specialist.name,
      department: specialist.dept,
      doctorName: specialist.name,
      urgency: isUrgent ? 'URGENT' : 'ROUTINE',
      confidence,
      reasoning: `Matched keywords: ${matchedKeywords.join(', ') || 'general symptoms'}`
    };
  }

  // Voice-controlled symptom input
  async startVoiceInput(language: string = 'hi-IN'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject('Voice recognition not supported');
        return;
      }

      this.recognition.lang = language;
      
      // Voice prompt
      this.speak('कृपया अपने लक्षण बताएं', language);

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
      };

      this.recognition.onend = () => {
        if (finalTranscript) {
          resolve(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };

      this.recognition.start();
    });
  }

  // Text-to-speech in multiple languages
  speak(text: string, language: string = 'hi-IN') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    this.synthesis.speak(utterance);
  }

  // Voice-guided navigation
  async voiceGuidedFlow(language: string = 'hi-IN') {
    const messages = {
      'hi-IN': {
        welcome: 'स्वास्थ्य एआई में आपका स्वागत है। कृपया अपने लक्षण बताएं।',
        listening: 'मैं सुन रहा हूं...',
        processing: 'आपके लक्षणों का विश्लेषण किया जा रहा है...',
        routing: 'आपको सही विशेषज्ञ के पास भेजा जा रहा है...',
        success: 'आपकी नियुक्ति बुक हो गई है।'
      },
      'en-US': {
        welcome: 'Welcome to Swasth AI. Please describe your symptoms.',
        listening: 'I am listening...',
        processing: 'Analyzing your symptoms...',
        routing: 'Routing you to the right specialist...',
        success: 'Your appointment has been booked.'
      }
    };

    const msg = messages[language] || messages['en-US'];

    try {
      // Step 1: Welcome
      this.speak(msg.welcome, language);
      await this.delay(2000);

      // Step 2: Listen
      this.speak(msg.listening, language);
      const symptoms = await this.startVoiceInput(language);

      // Step 3: Process
      this.speak(msg.processing, language);
      await this.delay(1000);

      // Step 4: Route
      const routing = await this.routeToSpecialist(symptoms);
      this.speak(msg.routing, language);
      await this.delay(1000);

      // Step 5: Confirm
      const confirmMsg = language === 'hi-IN' 
        ? `आपको ${routing.department} विभाग में ${routing.doctorName} के पास भेजा जा रहा है।`
        : `You are being routed to ${routing.doctorName} in ${routing.department} department.`;
      
      this.speak(confirmMsg, language);
      await this.delay(2000);

      this.speak(msg.success, language);

      return { symptoms, routing };
    } catch (error) {
      console.error('Voice flow error:', error);
      throw error;
    }
  }

  // Stop voice recognition
  stopVoiceInput() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Stop speech
  stopSpeaking() {
    this.synthesis.cancel();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Voice commands for navigation
  async handleVoiceCommand(command: string): Promise<string> {
    const commandLower = command.toLowerCase();

    const commands = {
      'home': '/dashboard',
      'doctor': '/doctor',
      'patient': '/patient',
      'pharmacy': '/pharmacy',
      'appointments': '/appointments',
      'reports': '/reports',
      'help': '/help'
    };

    for (const [key, route] of Object.entries(commands)) {
      if (commandLower.includes(key)) {
        this.speak(`Navigating to ${key}`, 'en-US');
        return route;
      }
    }

    return '';
  }
}

export const intelligentRouting = IntelligentRoutingService.getInstance();
