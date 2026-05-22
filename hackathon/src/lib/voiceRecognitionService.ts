// Voice recognition service with Hindi and English support
export class VoiceRecognitionService {
  private static instance: VoiceRecognitionService;
  private recognition: any = null;
  private isListening = false;
  
  static getInstance(): VoiceRecognitionService {
    if (!VoiceRecognitionService.instance) {
      VoiceRecognitionService.instance = new VoiceRecognitionService();
    }
    return VoiceRecognitionService.instance;
  }

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    
    // Support both Hindi and English
    this.recognition.lang = 'hi-IN'; // Start with Hindi
  }

  async startListening(onResult: (text: string, isFinal: boolean) => void, onError?: (error: string) => void): Promise<void> {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.isListening = true;
    let finalTranscript = '';
    let interimTranscript = '';

    // Handle results
    this.recognition.onresult = (event: any) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          onResult(finalTranscript.trim(), true);
        } else {
          interimTranscript += transcript;
          onResult(interimTranscript, false);
        }
      }
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Try switching language if no speech detected
      if (event.error === 'no-speech' || event.error === 'not-allowed') {
        this.switchLanguage();
        setTimeout(() => {
          if (this.isListening) {
            this.recognition.start();
          }
        }, 1000);
      } else {
        onError?.(event.error);
        this.isListening = false;
      }
    };

    // Handle end
    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart recognition to keep listening
        setTimeout(() => {
          if (this.isListening) {
            this.recognition.start();
          }
        }, 100);
      }
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      onError?.('Failed to start voice recognition');
      this.isListening = false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  private switchLanguage(): void {
    if (!this.recognition) return;
    
    // Toggle between Hindi and English
    const currentLang = this.recognition.lang;
    this.recognition.lang = currentLang === 'hi-IN' ? 'en-IN' : 'hi-IN';
    console.log('Switched voice recognition language to:', this.recognition.lang);
  }

  isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  getCurrentLanguage(): string {
    return this.recognition?.lang || 'hi-IN';
  }

  // Translate common Hindi medical terms to English for better processing
  translateHindiTerms(text: string): string {
    const hindiToEnglish = {
      'सिर दर्द': 'headache',
      'सिरदर्द': 'headache',
      'बुखार': 'fever',
      'खांसी': 'cough',
      'सांस लेने में तकलीफ': 'shortness of breath',
      'छाती में दर्द': 'chest pain',
      'पेट दर्द': 'stomach pain',
      'कमर दर्द': 'back pain',
      'जोड़ों में दर्द': 'joint pain',
      'चक्कर आना': 'dizziness',
      'उल्टी': 'vomiting',
      'दस्त': 'diarrhea',
      'कमजोरी': 'weakness',
      'थकान': 'fatigue',
      'सूजन': 'swelling',
      'खुजली': 'itching',
      'दाने': 'rash',
      'नींद नहीं आना': 'insomnia',
      'भूख नहीं लगना': 'loss of appetite'
    };

    let translatedText = text;
    
    Object.entries(hindiToEnglish).forEach(([hindi, english]) => {
      const regex = new RegExp(hindi, 'gi');
      translatedText = translatedText.replace(regex, english);
    });

    return translatedText;
  }

  // Process and clean the recognized text
  processRecognizedText(text: string): string {
    // Translate Hindi terms
    let processedText = this.translateHindiTerms(text);
    
    // Clean up common recognition errors
    processedText = processedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[।|]/g, '.') // Hindi punctuation to English
      .trim();

    return processedText;
  }
}

export const voiceRecognitionService = VoiceRecognitionService.getInstance();