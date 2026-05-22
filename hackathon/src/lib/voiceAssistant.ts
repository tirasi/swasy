// Global Voice Assistant - Guides through entire app
import { intelligentRouting } from './intelligentRouting';

export class VoiceAssistantService {
  private static instance: VoiceAssistantService;
  private isActive: boolean = false;
  private recognition: any = null;
  private currentPage: string = '';

  static getInstance(): VoiceAssistantService {
    if (!VoiceAssistantService.instance) {
      VoiceAssistantService.instance = new VoiceAssistantService();
    }
    return VoiceAssistantService.instance;
  }

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'hi-IN';
    }
  }

  // Enable voice assistant
  enable(language: string = 'hi-IN') {
    this.isActive = true;
    localStorage.setItem('voiceAssistantEnabled', 'true');
    
    const welcomeMsg = language === 'hi-IN'
      ? 'वॉइस असिस्टेंट चालू हो गया है। मैं आपकी मदद करूंगी। आप कुछ भी पूछ सकते हैं।'
      : 'Voice assistant enabled. I will guide you. You can ask me anything.';
    
    intelligentRouting.speak(welcomeMsg, language);
    this.startListening();
  }

  // Disable voice assistant
  disable() {
    this.isActive = false;
    localStorage.setItem('voiceAssistantEnabled', 'false');
    this.stopListening();
    
    intelligentRouting.speak('Voice assistant disabled', 'en-US');
  }

  // Check if enabled
  isEnabled(): boolean {
    return localStorage.getItem('voiceAssistantEnabled') === 'true';
  }

  // Start continuous listening
  private startListening() {
    if (!this.recognition || !this.isActive) return;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      this.handleVoiceCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      if (this.isActive) {
        setTimeout(() => this.recognition.start(), 1000);
      }
    };

    this.recognition.onend = () => {
      if (this.isActive) {
        this.recognition.start();
      }
    };

    this.recognition.start();
  }

  // Stop listening
  private stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Handle voice commands
  private async handleVoiceCommand(command: string) {
    console.log('Voice command:', command);

    // Navigation commands
    if (command.includes('home') || command.includes('होम')) {
      this.navigate('/dashboard', 'होम पेज पर जा रहे हैं', 'Going to home page');
    }
    else if (command.includes('report') || command.includes('रिपोर्ट')) {
      this.navigate('/reports', 'रिपोर्ट पेज पर जा रहे हैं', 'Going to reports page');
    }
    else if (command.includes('appointment') || command.includes('अपॉइंटमेंट')) {
      this.navigate('/appointments', 'अपॉइंटमेंट पेज पर जा रहे हैं', 'Going to appointments page');
    }
    else if (command.includes('help') || command.includes('मदद')) {
      this.provideHelp();
    }
    // Action commands
    else if (command.includes('submit') || command.includes('भेजें')) {
      this.speak('सबमिट बटन दबाएं', 'Press submit button');
      this.clickButton('submit');
    }
    else if (command.includes('book') || command.includes('बुक')) {
      this.speak('अपॉइंटमेंट बुक कर रहे हैं', 'Booking appointment');
      this.clickButton('book');
    }
    else if (command.includes('cancel') || command.includes('रद्द')) {
      this.speak('रद्द कर रहे हैं', 'Cancelling');
      this.clickButton('cancel');
    }
  }

  // Navigate to page
  private navigate(path: string, hindiMsg: string, englishMsg: string) {
    const language = this.recognition?.lang || 'hi-IN';
    intelligentRouting.speak(language === 'hi-IN' ? hindiMsg : englishMsg, language);
    
    setTimeout(() => {
      window.location.hash = path;
    }, 1000);
  }

  // Click button by text
  private clickButton(text: string) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.textContent?.toLowerCase().includes(text)) {
        btn.click();
      }
    });
  }

  // Provide contextual help
  private provideHelp() {
    const helpText = {
      'hi-IN': `
        मैं आपकी मदद कर सकती हूं। आप कह सकते हैं:
        होम - होम पेज पर जाने के लिए
        रिपोर्ट - रिपोर्ट देखने के लिए
        अपॉइंटमेंट - अपॉइंटमेंट बुक करने के लिए
        भेजें - फॉर्म सबमिट करने के लिए
        मदद - यह मदद सुनने के लिए
      `,
      'en-US': `
        I can help you. You can say:
        Home - to go to home page
        Reports - to view reports
        Appointment - to book appointment
        Submit - to submit form
        Help - to hear this help
      `
    };

    const language = this.recognition?.lang || 'hi-IN';
    intelligentRouting.speak(helpText[language], language);
  }

  // Speak helper
  private speak(hindiMsg: string, englishMsg: string) {
    const language = this.recognition?.lang || 'hi-IN';
    intelligentRouting.speak(language === 'hi-IN' ? hindiMsg : englishMsg, language);
  }

  // Guide through current page
  guidePage(pageName: string, language: string = 'hi-IN') {
    this.currentPage = pageName;

    const guides = {
      'patient-dashboard': {
        'hi-IN': 'आप पेशेंट डैशबोर्ड पर हैं। यहां आप अपनी रिपोर्ट भेज सकते हैं, अपॉइंटमेंट बुक कर सकते हैं, और अपनी हेल्थ रिकॉर्ड देख सकते हैं।',
        'en-US': 'You are on patient dashboard. Here you can submit reports, book appointments, and view your health records.'
      },
      'doctor-dashboard': {
        'hi-IN': 'आप डॉक्टर डैशबोर्ड पर हैं। यहां आप पेशेंट देख सकते हैं, प्रिस्क्रिप्शन लिख सकते हैं, और एआई डायग्नोसिस कर सकते हैं।',
        'en-US': 'You are on doctor dashboard. Here you can view patients, write prescriptions, and use AI diagnosis.'
      },
      'pharmacy-dashboard': {
        'hi-IN': 'आप फार्मेसी डैशबोर्ड पर हैं। यहां आप प्रिस्क्रिप्शन देख सकते हैं और मेडिसिन डिस्पेंस कर सकते हैं।',
        'en-US': 'You are on pharmacy dashboard. Here you can view prescriptions and dispense medicines.'
      }
    };

    const guide = guides[pageName];
    if (guide && this.isActive) {
      intelligentRouting.speak(guide[language], language);
    }
  }

  // Announce element focus
  announceElement(elementText: string, language: string = 'hi-IN') {
    if (this.isActive) {
      intelligentRouting.speak(elementText, language);
    }
  }

  // Read form field
  readField(fieldName: string, language: string = 'hi-IN') {
    if (this.isActive) {
      const msg = language === 'hi-IN'
        ? `${fieldName} फील्ड`
        : `${fieldName} field`;
      intelligentRouting.speak(msg, language);
    }
  }
}

export const voiceAssistant = VoiceAssistantService.getInstance();
