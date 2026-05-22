// AI Agent for Medical Report Analysis
class AIAgent {
  constructor() {
    this.analysisHistory = [];
  }

  async analyzePatientReport(report) {
    const analysis = {
      id: `AI_${Date.now()}`,
      patientId: report.patientId,
      reportId: report.id,
      timestamp: new Date().toISOString(),
      symptoms: this.extractSymptoms(report.description),
      severity: this.assessSeverity(report.description),
      recommendations: this.generateRecommendations(report.description),
      suggestedTests: this.suggestTests(report.description),
      urgency: this.determineUrgency(report.description),
      aiConfidence: this.calculateConfidence(report.description)
    };

    // Store analysis
    const analyses = JSON.parse(localStorage.getItem('aiAnalyses') || '[]');
    analyses.push(analysis);
    localStorage.setItem('aiAnalyses', JSON.stringify(analyses));

    // Trigger doctor notification
    this.notifyDoctor(analysis);

    return analysis;
  }

  extractSymptoms(description) {
    const symptomKeywords = {
      'chest pain': ['chest', 'pain', 'heart', 'cardiac'],
      'headache': ['head', 'headache', 'migraine'],
      'fever': ['fever', 'temperature', 'hot'],
      'cough': ['cough', 'throat', 'respiratory'],
      'nausea': ['nausea', 'vomit', 'stomach'],
      'fatigue': ['tired', 'fatigue', 'weak', 'energy']
    };

    const detected = [];
    const desc = description.toLowerCase();
    
    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        detected.push(symptom);
      }
    }

    return detected.length > 0 ? detected : ['general discomfort'];
  }

  assessSeverity(description) {
    const severityIndicators = {
      high: ['severe', 'intense', 'unbearable', 'emergency', 'critical'],
      medium: ['moderate', 'noticeable', 'concerning', 'persistent'],
      low: ['mild', 'slight', 'minor', 'occasional']
    };

    const desc = description.toLowerCase();
    
    for (const [level, indicators] of Object.entries(severityIndicators)) {
      if (indicators.some(indicator => desc.includes(indicator))) {
        return level;
      }
    }

    return 'medium'; // default
  }

  generateRecommendations(description) {
    const symptoms = this.extractSymptoms(description);
    const recommendations = [];

    if (symptoms.includes('chest pain')) {
      recommendations.push('ECG recommended', 'Monitor blood pressure', 'Avoid strenuous activity');
    }
    if (symptoms.includes('headache')) {
      recommendations.push('Rest in dark room', 'Stay hydrated', 'Monitor symptoms');
    }
    if (symptoms.includes('fever')) {
      recommendations.push('Monitor temperature', 'Stay hydrated', 'Rest');
    }

    return recommendations.length > 0 ? recommendations : ['General monitoring recommended'];
  }

  suggestTests(description) {
    const symptoms = this.extractSymptoms(description);
    const tests = [];

    if (symptoms.includes('chest pain')) {
      tests.push('ECG', 'Chest X-ray', 'Blood pressure check');
    }
    if (symptoms.includes('fever')) {
      tests.push('Complete blood count', 'Temperature monitoring');
    }
    if (symptoms.includes('headache')) {
      tests.push('Blood pressure check', 'Neurological assessment');
    }

    return tests.length > 0 ? tests : ['Basic vital signs'];
  }

  determineUrgency(description) {
    const urgentKeywords = ['severe', 'emergency', 'critical', 'unbearable', 'chest pain', 'difficulty breathing'];
    const desc = description.toLowerCase();
    
    if (urgentKeywords.some(keyword => desc.includes(keyword))) {
      return 'HIGH';
    }
    
    return 'MEDIUM';
  }

  calculateConfidence(description) {
    // Simple confidence based on description length and keyword matches
    const wordCount = description.split(' ').length;
    const symptoms = this.extractSymptoms(description);
    
    let confidence = Math.min(0.9, 0.3 + (wordCount * 0.02) + (symptoms.length * 0.1));
    return Math.round(confidence * 100) / 100;
  }

  notifyDoctor(analysis) {
    // Create doctor notification
    const notification = {
      id: `NOTIF_${Date.now()}`,
      doctorId: 'all', // Notify all doctors for now
      patientId: analysis.patientId,
      type: 'NEW_PATIENT_REPORT',
      title: 'New Patient Report Requires Attention',
      message: `AI Analysis: ${analysis.symptoms.join(', ')} - Severity: ${analysis.severity}`,
      urgency: analysis.urgency,
      timestamp: new Date().toISOString(),
      read: false,
      analysisId: analysis.id
    };

    const notifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));

    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('newDoctorNotification', { detail: notification }));
  }
}

export const aiAgent = new AIAgent();