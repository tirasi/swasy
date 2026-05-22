// AI Agent for patient report analysis and intelligent notifications
import { syncService } from './syncService';

export class AIAgent {
  private static instance: AIAgent;
  
  static getInstance(): AIAgent {
    if (!AIAgent.instance) {
      AIAgent.instance = new AIAgent();
    }
    return AIAgent.instance;
  }

  async analyzePatientReport(healthReport: any) {
    try {
      const symptoms = Array.isArray(healthReport.symptoms) && healthReport.symptoms.length > 0
        ? healthReport.symptoms
        : this.extractSymptoms(healthReport.description);
      const severity = this.assessSeverity(symptoms, healthReport.description);
      const urgency = this.determineUrgency(symptoms, severity);
      const confidence = this.calculateConfidence(symptoms, healthReport.description);
      
      const analysis = {
        id: `AI_${Date.now()}`,
        patientId: healthReport.patientId,
        reportId: healthReport.id,
        symptoms: symptoms,
        severity: severity,
        urgency: urgency,
        aiConfidence: confidence,
        recommendations: this.generateRecommendations(symptoms, severity),
        timestamp: new Date().toISOString(),
        analysisType: 'PATIENT_REPORT'
      };

      // Save analysis
      const analyses = JSON.parse(localStorage.getItem('aiAnalyses') || '[]');
      analyses.push(analysis);
      localStorage.setItem('aiAnalyses', JSON.stringify(analyses));

      // Send notification to doctor if urgent
      if (urgency === 'HIGH' || severity === 'SEVERE') {
        this.sendDoctorNotification(analysis, healthReport);
      }

      return analysis;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return null;
    }
  }

  private extractSymptoms(description: string): string[] {
    const text = description.toLowerCase();
    const symptomKeywords = [
      'chest pain', 'shortness of breath', 'fever', 'headache', 'cough',
      'nausea', 'vomiting', 'dizziness', 'fatigue', 'weakness',
      'back pain', 'joint pain', 'rash', 'swelling', 'bleeding'
    ];
    
    return symptomKeywords.filter(symptom => text.includes(symptom));
  }

  private assessSeverity(symptoms: string[], description: string): string {
    const text = description.toLowerCase();
    const severeIndicators = ['severe', 'intense', 'unbearable', 'emergency', 'critical'];
    const moderateIndicators = ['moderate', 'persistent', 'ongoing', 'worsening'];
    
    // Check for cardiac symptoms
    if (symptoms.some(s => s.includes('chest pain') || s.includes('shortness of breath'))) {
      return 'SEVERE';
    }
    
    if (severeIndicators.some(indicator => text.includes(indicator))) {
      return 'SEVERE';
    }
    
    if (moderateIndicators.some(indicator => text.includes(indicator))) {
      return 'MODERATE';
    }
    
    return 'MILD';
  }

  private determineUrgency(symptoms: string[], severity: string): string {
    // High urgency conditions
    const emergencySymptoms = ['chest pain', 'shortness of breath', 'severe headache'];
    
    if (symptoms.some(s => emergencySymptoms.includes(s)) || severity === 'SEVERE') {
      return 'HIGH';
    }
    
    if (severity === 'MODERATE') {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  private calculateConfidence(symptoms: string[], description: string): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on symptom clarity
    if (symptoms.length > 0) {
      confidence += 0.1 * symptoms.length;
    }
    
    // Increase confidence for detailed descriptions
    if (description.length > 50) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  }

  private generateRecommendations(symptoms: string[], severity: string): string[] {
    const recommendations = [];
    
    if (symptoms.includes('chest pain')) {
      recommendations.push('Immediate ECG and cardiac evaluation required');
      recommendations.push('Monitor vital signs closely');
    }
    
    if (symptoms.includes('shortness of breath')) {
      recommendations.push('Oxygen saturation monitoring');
      recommendations.push('Chest X-ray recommended');
    }
    
    if (severity === 'SEVERE') {
      recommendations.push('Priority consultation required');
      recommendations.push('Consider emergency protocols');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Standard clinical evaluation');
      recommendations.push('Monitor symptom progression');
    }
    
    return recommendations;
  }

  private sendDoctorNotification(analysis: any, healthReport: any) {
    const notification = {
      id: `notif_${Date.now()}_ai`,
      type: 'AI_ANALYSIS_ALERT',
      title: `🤖 AI Alert: ${analysis.urgency} Priority Patient`,
      message: `Patient ${healthReport.patientName} requires attention. AI detected ${analysis.severity.toLowerCase()} symptoms: ${analysis.symptoms.join(', ')}. Confidence: ${Math.round(analysis.aiConfidence * 100)}%`,
      targetRole: 'doctor',
      patientId: healthReport.patientId,
      analysisId: analysis.id,
      urgency: analysis.urgency,
      priority: analysis.urgency,
      timestamp: new Date().toISOString()
    };

    // Save to doctor notifications
    const doctorNotifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
    doctorNotifications.unshift(notification);
    localStorage.setItem('doctorNotifications', JSON.stringify(doctorNotifications));

    // Send via sync service
    syncService.sendNotification(notification);

    // Trigger immediate window event
    window.dispatchEvent(new CustomEvent('newDoctorNotification', { detail: notification }));
  }
}

export const aiAgent = AIAgent.getInstance();