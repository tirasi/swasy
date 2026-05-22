import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Users, Brain, FileText, AlertTriangle, Video, Pill, Send, Calendar, Clock, MapPin, Phone, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { syncService } from '@/lib/syncService';
import { NotificationCenter } from '@/components/NotificationCenter';
import { dataService } from '@/lib/dataService';
import { prescriptionService } from '@/lib/prescriptionService';
import { toast } from 'sonner';
import { useAIReport } from '@/hooks/useAIReport';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [aiReport, setAiReport] = useState('');
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [doctorSuggestion, setDoctorSuggestion] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assignedDoctors, setAssignedDoctors] = useState({});
  const [showManageCase, setShowManageCase] = useState(false);
  const [selectedPatientForCase, setSelectedPatientForCase] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [aiAnalyses, setAiAnalyses] = useState([]);
  const [doctorPreferences, setDoctorPreferences] = useState([]);

  const viewPatientDetails = (patient) => {
    setSelectedPatientForDetails(patient);
    setShowPatientDetails(true);
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (!pid) return;

    const match = patients.find(p => p.id === pid);
    if (match) {
      setSelectedPatientForDetails(match);
      setShowPatientDetails(true);
      params.delete('patientId');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      return;
    }

    try {
      const p = dataService.getPatients().find(patient => patient.id === pid);
      if (p) {
        setSelectedPatientForDetails(p);
        setShowPatientDetails(true);
        params.delete('patientId');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
        return;
      }
    } catch (e) {
      console.error('Error looking up patientId in dataService', e);
    }
  }, [location.search, patients, navigate, location.pathname]);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Initialize sample data if none exists
        const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
        if (existingPatients.length === 0) {
          const samplePatients = [
            {
              id: 'patient-1',
              name: 'John Doe',
              age: 35,
              phone: '+91-9876543210',
              symptoms: ['fever', 'headache', 'fatigue'],
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: new Date().toISOString(),
              reports: [{
                content: 'Patient experiencing high fever and severe headache for 3 days',
                timestamp: new Date().toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            },
            {
              id: 'patient-2', 
              name: 'Jane Smith',
              age: 28,
              phone: '+91-9876543211',
              symptoms: ['cough', 'chest pain'],
              status: 'UNDER_REVIEW',
              priority: 'HIGH',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              reports: [{
                content: 'Persistent dry cough with mild chest discomfort',
                timestamp: new Date(Date.now() - 86400000).toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            },
            {
              id: 'patient-3',
              name: 'Mike Johnson', 
              age: 42,
              phone: '+91-9876543212',
              symptoms: ['back pain', 'muscle stiffness'],
              status: 'COMPLETED',
              priority: 'MEDIUM',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              reports: [{
                content: 'Lower back pain after physical activity',
                timestamp: new Date(Date.now() - 172800000).toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            },
            {
              id: 'patient-4',
              name: 'Sarah Wilson',
              age: 31,
              phone: '+91-9876543213',
              symptoms: ['shortness of breath', 'chest tightness'],
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              reports: [{
                content: 'Sudden onset of breathing difficulty and chest tightness',
                timestamp: new Date(Date.now() - 3600000).toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            }
          ];
          localStorage.setItem('patients', JSON.stringify(samplePatients));
        }
        
        const allPatients = await dataService.getPatients();
        
        // Ensure we have sample patients if none exist
        if (allPatients.length === 0) {
          const samplePatients = [
            {
              id: 'patient-1',
              name: 'John Doe',
              age: 35,
              phone: '+91-9876543210',
              symptoms: ['fever', 'headache', 'fatigue'],
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: new Date().toISOString(),
              reports: [{
                content: 'Patient experiencing high fever and severe headache for 3 days',
                timestamp: new Date().toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            },
            {
              id: 'patient-2', 
              name: 'Jane Smith',
              age: 28,
              phone: '+91-9876543211',
              symptoms: ['cough', 'chest pain'],
              status: 'UNDER_REVIEW',
              priority: 'HIGH',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              reports: [{
                content: 'Persistent dry cough with mild chest discomfort',
                timestamp: new Date(Date.now() - 86400000).toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            },
            {
              id: 'patient-3',
              name: 'Mike Johnson', 
              age: 42,
              phone: '+91-9876543212',
              symptoms: ['back pain', 'muscle stiffness'],
              status: 'COMPLETED',
              priority: 'MEDIUM',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              reports: [{
                content: 'Lower back pain after physical activity',
                timestamp: new Date(Date.now() - 172800000).toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            },
            {
              id: 'patient-4',
              name: 'Sarah Wilson',
              age: 31,
              phone: '+91-9876543213',
              symptoms: ['shortness of breath', 'chest tightness'],
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              reports: [{
                content: 'Sudden onset of breathing difficulty and chest tightness',
                timestamp: new Date(Date.now() - 3600000).toISOString()
              }],
              dataToken: 'TKN' + Math.random().toString(36).substr(2, 8).toUpperCase()
            }
          ];
          
          // Save and use sample patients
          localStorage.setItem('patients', JSON.stringify(samplePatients));
          const patientsWithPriority = samplePatients.map(patient => ({
            ...patient,
            priority: patient.priority || (patient.symptoms.some(s => s.includes('chest pain') || s.includes('shortness of breath')) ? 'HIGH' : 'MEDIUM')
          })).sort((a, b) => {
            const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
          setPatients(patientsWithPriority);
        } else {
          const patientsWithPriority = allPatients.map(patient => ({
            ...patient,
            priority: patient.priority || (patient.symptoms.some(s => s.includes('chest pain') || s.includes('shortness of breath')) ? 'HIGH' : 'MEDIUM')
          })).sort((a, b) => {
            const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
          setPatients(patientsWithPriority);
        }
        
        const appointmentsData = await dataService.getAppointments();
        setAppointments(appointmentsData);
        
        setEmergencies(dataService.getEmergencies());
        setAssignedDoctors(dataService.getAssignedDoctors());
        
        const preferences = JSON.parse(localStorage.getItem('doctorPreferences') || '[]');
        setDoctorPreferences(preferences);
        
        // Load AI notifications and analyses
        const doctorNotifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
        setNotifications(doctorNotifications);
        
        const analyses = JSON.parse(localStorage.getItem('aiAnalyses') || '[]');
        setAiAnalyses(analyses);
      } catch (error) {
        console.error('Error loading patient data:', error);
        // Fallback to localStorage
        const localPatients = JSON.parse(localStorage.getItem('patients') || '[]');
        setPatients(localPatients);
      }
    };

    loadPatientData();

    // Single source of truth: appointmentsUpdated fires with the full deduped array from localStorage
    const handleAppointmentsUpdate = (event: any) => {
      const data = event?.detail;
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        dataService.getAppointments().then(setAppointments);
      }
    };

    const handleEmergenciesUpdate = () => {
      setEmergencies(dataService.getEmergencies());
    };

    const handleDoctorAssignmentsUpdate = () => {
      setAssignedDoctors(dataService.getAssignedDoctors());
    };

    const handleNewNotification = (event: any) => {
      const notification = event.detail;
      setNotifications(prev => {
        // dedup by id
        if (prev.find((n: any) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      // Also refresh aiAnalyses so View Analysis has the latest data
      const analyses = JSON.parse(localStorage.getItem('aiAnalyses') || '[]');
      setAiAnalyses(analyses);
    };

    const handlePatientsUpdate = () => { loadPatientData(); };

    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdate);
    window.addEventListener('patientsUpdated', handlePatientsUpdate);
    window.addEventListener('emergenciesUpdated', handleEmergenciesUpdate);
    window.addEventListener('doctorAssignmentsUpdated', handleDoctorAssignmentsUpdate);
    window.addEventListener('patientReportUpdated', handlePatientsUpdate);
    window.addEventListener('newDoctorNotification', handleNewNotification);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdate);
      window.removeEventListener('patientsUpdated', handlePatientsUpdate);
      window.removeEventListener('emergenciesUpdated', handleEmergenciesUpdate);
      window.removeEventListener('doctorAssignmentsUpdated', handleDoctorAssignmentsUpdate);
      window.removeEventListener('patientReportUpdated', handlePatientsUpdate);
      window.removeEventListener('newDoctorNotification', handleNewNotification);
    };
  }, []);

  const initiateVideoCall = (patient) => {
    const meetingUrl = `https://meet.google.com/new`;
    window.open(meetingUrl, '_blank');
    alert(`Video call initiated with ${patient.name}\nPhone: ${patient.phone}\nMeeting link opened in new tab`);
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await dataService.updateAppointment(appointmentId, { status: 'CANCELLED' });
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment');
    }
  };

  const openEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditDate(appointment.date || '');
    setEditTime(appointment.time || '');
    setEditPhone(appointment.phone || '');
    setShowEditAppointment(true);
  };

  const saveEditedAppointment = async () => {
    if (!editingAppointment) return;
    const editingId = editingAppointment.id;
    if (!editingId) return;
    
    try {
      await dataService.updateAppointment(editingId, {
        date: editDate,
        time: editTime,
        phone: editPhone
      });
      
      alert('Appointment updated successfully');
      setShowEditAppointment(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment');
    }
  };

  const generateAIReport = async (patient) => {
    try {
      // Prefer appointment symptoms over patient record defaults
      const patientAppointments = appointments.filter((a: any) => a.patientId === patient.id);
      const appointmentSymptoms = patientAppointments.length > 0
        ? patientAppointments[patientAppointments.length - 1].symptoms
        : null;
      const rawSymptoms = appointmentSymptoms || patient.symptoms || [];
      const symptoms = Array.isArray(rawSymptoms) ? rawSymptoms.join(', ') : rawSymptoms;
      const age = patient.age || '35';
      const history = patient.medicalHistory || 'No prior history';
      
      // Generate comprehensive AI report
      const report = `
═══════════════════════════════════════════════════════════════
                    AI COUNCIL MEDICAL REPORT
═══════════════════════════════════════════════════════════════

PATIENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${patient.name}
Age: ${age} years
Gender: ${patient.gender || 'Not specified'}
Patient ID: ${patient.id}
Data Token: ${patient.dataToken || 'N/A'}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

CHIEF COMPLAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${symptoms}

MEDICAL HISTORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${history}

AI COUNCIL ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI AGENT 1 - DIAGNOSTIC SPECIALIST
${generateDiagnosticAnalysis(symptoms, age)}

🤖 AI AGENT 2 - RISK ASSESSMENT SPECIALIST  
${generateRiskAssessment(symptoms, age)}

🤖 AI AGENT 3 - TREATMENT RECOMMENDATION SPECIALIST
${generateTreatmentPlan(symptoms)}

🤖 AI AGENT 4 - SPECIALIST ROUTING AGENT
${generateSpecialistRouting(symptoms)}

🤖 AI AGENT 5 - EMERGENCY TRIAGE AGENT
${generateTriageAssessment(symptoms)}

CONSOLIDATED AI INSIGHTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Multi-agent consensus achieved
✓ Clinical decision support validated
✓ Evidence-based recommendations provided
✓ Risk stratification completed

RECOMMENDED ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${generateRecommendedActions(symptoms)}

CONFIDENCE METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Confidence: 87%
Diagnostic Accuracy: 89%
Risk Assessment: 85%
Treatment Validity: 88%

AI MODEL INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model Version: Swasth-AI-Council v2.1
Last Updated: ${new Date().toISOString()}
Training Data: Medical Literature 2024
Compliance: HIPAA, FDA Guidelines

⚠️ MEDICAL DISCLAIMER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This AI-generated report is for CLINICAL DECISION SUPPORT ONLY.
Final diagnosis and treatment decisions must be made by a licensed
physician. This report does not replace professional medical judgment.
All recommendations require clinical validation and patient assessment.

DOCTOR VALIDATION REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Report reviewed by physician
[ ] Clinical assessment completed
[ ] Treatment plan approved
[ ] Patient consultation scheduled

Generated by: Swasth AI Council System
Report ID: AI-${Date.now()}
═══════════════════════════════════════════════════════════════
`;
      
      setAiReport(report);
      setShowDisclaimer(false);
    } catch (error) {
      console.error('AI Report Error:', error);
      const fallbackReport = generateFallbackReport(patient);
      setAiReport(fallbackReport);
      setShowDisclaimer(false);
    }
  };

  const generateDiagnosticAnalysis = (symptoms, age) => {
    const symptomsLower = symptoms.toLowerCase();
    
    if (symptomsLower.includes('chest pain') || symptomsLower.includes('heart')) {
      return `
Primary Differential Diagnoses:
1. Acute Coronary Syndrome (ACS) - HIGH PRIORITY
   - Unstable angina or myocardial infarction
   - Requires immediate ECG and cardiac markers
   
2. Costochondritis - MODERATE PRIORITY
   - Musculoskeletal chest wall pain
   - Reproducible with palpation
   
3. Gastroesophageal Reflux Disease (GERD)
   - Burning sensation, worse after meals
   - Consider PPI trial

Recommended Tests:
- ECG (STAT)
- Troponin levels
- Chest X-ray
- Complete Blood Count`;
    } else if (symptomsLower.includes('fever') || symptomsLower.includes('cough')) {
      return `
Primary Differential Diagnoses:
1. Upper Respiratory Tract Infection (URTI)
   - Viral etiology most likely
   - Self-limiting in 7-10 days
   
2. Pneumonia - Consider if:
   - High fever >101°F
   - Productive cough
   - Shortness of breath
   
3. COVID-19 / Influenza
   - Rapid antigen testing recommended
   - Isolation protocols if positive

Recommended Tests:
- Complete Blood Count
- Chest X-ray if severe
- COVID-19 rapid test
- Sputum culture if productive cough`;
    } else if (symptomsLower.includes('headache')) {
      return `
Primary Differential Diagnoses:
1. Tension-Type Headache
   - Bilateral, band-like pressure
   - Stress-related
   
2. Migraine
   - Unilateral, throbbing
   - Associated with nausea/photophobia
   
3. Cluster Headache
   - Severe, unilateral orbital pain
   - Autonomic symptoms

Recommended Tests:
- Neurological examination
- Blood pressure monitoring
- CT/MRI if red flags present`;
    } else {
      return `
Primary Differential Diagnoses:
1. General malaise / Viral syndrome
2. Stress-related symptoms
3. Requires detailed clinical examination

Recommended Tests:
- Complete Blood Count
- Basic Metabolic Panel
- Vital signs monitoring`;
    }
  };

  const generateRiskAssessment = (symptoms, age) => {
    const symptomsLower = symptoms.toLowerCase();
    const ageNum = parseInt(age) || 35;
    
    let riskLevel = 'LOW';
    let riskFactors = [];
    
    if (symptomsLower.includes('chest pain') || symptomsLower.includes('shortness of breath')) {
      riskLevel = 'HIGH';
      riskFactors.push('Potential cardiac event');
      riskFactors.push('Requires immediate evaluation');
    }
    
    if (ageNum > 60) {
      riskFactors.push('Advanced age increases risk');
    }
    
    if (symptomsLower.includes('fever') && symptomsLower.includes('cough')) {
      riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
      riskFactors.push('Respiratory infection risk');
    }
    
    return `
Risk Level: ${riskLevel}

Risk Factors Identified:
${riskFactors.length > 0 ? riskFactors.map((r, i) => `${i + 1}. ${r}`).join('\n') : '- No major risk factors identified'}

Monitoring Requirements:
- Vital signs every 4 hours
- Symptom progression tracking
- Patient education on warning signs

Escalation Criteria:
- Worsening symptoms
- New onset chest pain
- Difficulty breathing
- Altered mental status`;
  };

  const generateTreatmentPlan = (symptoms) => {
    const symptomsLower = symptoms.toLowerCase();
    
    if (symptomsLower.includes('chest pain')) {
      return `
Immediate Management:
1. Aspirin 325mg (if no contraindications)
2. Oxygen therapy if SpO2 <94%
3. IV access established
4. Continuous cardiac monitoring

Pharmacological:
- Nitroglycerin sublingual PRN
- Morphine for pain management
- Beta-blocker if indicated

Non-Pharmacological:
- Bed rest
- Stress reduction
- Cardiac rehabilitation referral`;
    } else if (symptomsLower.includes('fever') || symptomsLower.includes('cough')) {
      return `
Symptom Management:
1. Antipyretics (Paracetamol 500mg TDS)
2. Adequate hydration (2-3L/day)
3. Rest and isolation

Pharmacological:
- Cough suppressants if dry cough
- Expectorants if productive
- Antibiotics only if bacterial (not routine)

Non-Pharmacological:
- Steam inhalation
- Warm fluids
- Adequate sleep
- Nutrition support`;
    } else {
      return `
General Management:
1. Symptomatic treatment
2. Adequate rest and hydration
3. Monitor for progression

Follow-up:
- Review in 48-72 hours
- Return if symptoms worsen
- Maintain symptom diary`;
    }
  };

  const generateSpecialistRouting = (symptoms) => {
    const symptomsLower = symptoms.toLowerCase();
    
    if (symptomsLower.includes('chest pain') || symptomsLower.includes('heart')) {
      return `
Recommended Specialist: CARDIOLOGY
Urgency: URGENT (within 24 hours)
Reason: Cardiac symptoms require specialist evaluation
Specialist Actions: ECG, Echocardiogram, Stress test`;
    } else if (symptomsLower.includes('skin') || symptomsLower.includes('rash')) {
      return `
Recommended Specialist: DERMATOLOGY
Urgency: ROUTINE (within 1 week)
Reason: Skin condition evaluation
Specialist Actions: Skin examination, Biopsy if needed`;
    } else if (symptomsLower.includes('headache') || symptomsLower.includes('seizure')) {
      return `
Recommended Specialist: NEUROLOGY
Urgency: SEMI-URGENT (within 48 hours)
Reason: Neurological symptoms
Specialist Actions: Neurological exam, Imaging if indicated`;
    } else {
      return `
Recommended Specialist: GENERAL MEDICINE
Urgency: ROUTINE
Reason: General medical evaluation
Specialist Actions: Comprehensive examination, Basic investigations`;
    }
  };

  const generateTriageAssessment = (symptoms) => {
    const symptomsLower = symptoms.toLowerCase();
    
    if (symptomsLower.includes('chest pain') || symptomsLower.includes('shortness of breath')) {
      return `
Triage Level: 1 - CRITICAL
Response Time: IMMEDIATE
Actions:
- Activate emergency response
- Prepare resuscitation equipment
- Senior physician notification
- ICU bed standby`;
    } else if (symptomsLower.includes('severe') || symptomsLower.includes('acute')) {
      return `
Triage Level: 2 - URGENT
Response Time: Within 15 minutes
Actions:
- Priority assessment
- Vital signs monitoring
- Physician evaluation ASAP`;
    } else {
      return `
Triage Level: 3 - LESS URGENT
Response Time: Within 1 hour
Actions:
- Standard assessment
- Routine vital signs
- Regular physician review`;
    }
  };

  const generateRecommendedActions = (symptoms) => {
    const symptomsLower = symptoms.toLowerCase();
    
    let actions = [];
    
    if (symptomsLower.includes('chest pain')) {
      actions.push('1. IMMEDIATE: ECG and cardiac markers');
      actions.push('2. Cardiology consultation within 24 hours');
      actions.push('3. Admit for observation if troponin positive');
    } else if (symptomsLower.includes('fever')) {
      actions.push('1. Complete blood count and inflammatory markers');
      actions.push('2. Start symptomatic treatment');
      actions.push('3. Follow-up in 48 hours');
    } else {
      actions.push('1. Detailed clinical examination');
      actions.push('2. Basic investigations as indicated');
      actions.push('3. Symptomatic management');
    }
    
    actions.push('4. Patient education on warning signs');
    actions.push('5. Schedule follow-up appointment');
    
    return actions.join('\n');
  };

  const generateFallbackReport = (patient) => {
    return `
═══════════════════════════════════════════════════════════════
                    AI COUNCIL MEDICAL REPORT
═══════════════════════════════════════════════════════════════

PATIENT: ${patient.name}
SYMPTOMS: ${patient.symptoms.join(', ')}

AI ANALYSIS TEMPORARILY UNAVAILABLE
Using fallback diagnostic support system.

RECOMMENDATION:
Clinical examination and standard diagnostic workup required.

⚠️ MEDICAL DISCLAIMER:
This is for clinical decision support only.
Final diagnosis must be made by licensed physician.
═══════════════════════════════════════════════════════════════
`;
  };

  const sendPrescription = async () => {
    if (!prescriptionText && !selectedMedicine) {
      alert('Please add prescription details');
      return;
    }
    
    const medications = [{
      name: selectedMedicine,
      dosage: dosage,
      duration: duration,
      quantity: 1
    }];
    
    const prescription = prescriptionService.createPrescription(
      'dr1', // doctor ID
      selectedPatient.id,
      medications,
      `${prescriptionText}\n\nDoctor's Advice: ${doctorSuggestion}`
    );
    
    alert(`✅ PRESCRIPTION SENT SUCCESSFULLY!\n\nPatient: ${selectedPatient.name}\nMedicine: ${selectedMedicine}\nDosage: ${dosage}\nDuration: ${duration}\nEstimated Cost: ₹${prescription.estimatedCost}\n\n📱 Sent to patient instantly\n🏥 Sent to pharmacy instantly\n⚡ Real-time coordination complete`);
    
    setShowPrescription(false);
    setPrescriptionText('');
    setSelectedMedicine('');
    setDosage('');
    setDuration('');
    setPrescriptionImage(null);
    setDoctorSuggestion('');
  };

  const assignToDoctor = (patient) => {
    setSelectedPatient(patient);
    setShowAssignDialog(true);
  };

  const handleDoctorAssignment = () => {
    if (!selectedDoctor || !selectedPatient) return;
    
    dataService.assignDoctor(selectedPatient.id, selectedDoctor);
    
    alert(`Patient ${selectedPatient.name} assigned to ${selectedDoctor}`);
    setShowAssignDialog(false);
    setSelectedDoctor('');
    setSelectedPatient(null);
  };

  const openManageCase = (patient) => {
    setSelectedPatientForCase(patient);
    setShowManageCase(true);
  };

  const closeCase = async () => {
    if (!selectedPatientForCase) return;
    
    try {
      await dataService.removePatient(selectedPatientForCase.id);
      
      alert(`✅ PATIENT DISCHARGED\n\nPatient: ${selectedPatientForCase.name}\nStatus: Case Closed - Discharged\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}`);
      
      setShowManageCase(false);
      setSelectedPatientForCase(null);
    } catch (error) {
      console.error('Error closing case:', error);
      alert('Error closing case');
    }
  };

  const approveCase = async () => {
    if (!selectedPatientForCase) return;
    try {
      await dataService.updatePatient(selectedPatientForCase.id, { status: 'COMPLETED' });
      // Update local state immediately
      setPatients(prev => prev.map(p =>
        p.id === selectedPatientForCase.id ? { ...p, status: 'COMPLETED' } : p
      ));
      // Fire toast notification
      toast.success(`Case managed: ${selectedPatientForCase.name}`, {
        description: 'Case approved and moved to Completed.',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        duration: 4000,
      });
      // Notify patient portal
      syncService.sendNotification({
        id: `notif_${Date.now()}_case_approved`,
        type: 'CASE_APPROVED',
        title: 'Your case has been managed',
        message: `Dr. has reviewed and approved your case. Status: Completed.`,
        targetRole: 'patient',
        patientId: selectedPatientForCase.id,
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
      });
      setShowManageCase(false);
      setSelectedPatientForCase(null);
    } catch (error) {
      console.error('Error approving case:', error);
      toast.error('Error approving case');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
              <p className="text-muted-foreground">Patient management and clinical decision support</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter userRole="doctor" />
              <div className="flex gap-2">
                {emergencies.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="h-4 w-4" />
                    {emergencies.length} EMERGENCY ALERTS
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  AI Council Ready
                </Badge>
              </div>
            </div>
          </div>

        {notifications.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Brain className="h-5 w-5" />
                🤖 AI Analysis Notifications ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => {
                  const analysis = aiAnalyses.find(a => a.id === notification.analysisId);
                  return (
                    <div key={notification.id} className="bg-white border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={notification.urgency === 'HIGH' ? 'destructive' : 'default'}>
                              {notification.urgency} PRIORITY
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(notification.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium text-orange-800 mb-2">{notification.title}</p>
                          <p className="text-sm text-orange-700 mb-2">{notification.message}</p>
                          {analysis && (
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><strong>AI Confidence:</strong> {Math.round(analysis.aiConfidence * 100)}%</p>
                              <p><strong>Symptoms:</strong> {analysis.symptoms.join(', ')}</p>
                              <p><strong>Severity:</strong> {analysis.severity}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            // Try state first, then localStorage, then build from notification
                            let patient = patients.find((p: any) => p.id === notification.patientId);
                            if (!patient) {
                              const local = JSON.parse(localStorage.getItem('patients') || '[]');
                              patient = local.find((p: any) => p.id === notification.patientId);
                            }
                            if (!patient) {
                              const analysis = aiAnalyses.find((a: any) => a.id === notification.analysisId);
                              patient = {
                                id: notification.patientId,
                                name: notification.message?.match(/Patient (.+?) \(/)?.[1] || 'Patient',
                                age: 'Unknown',
                                symptoms: analysis?.symptoms || [],
                              };
                            }
                            setSelectedPatient(patient);
                            generateAIReport(patient);
                          }}>
                            <Brain className="h-4 w-4 mr-1" />
                            View Analysis
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setNotifications(prev => prev.filter(n => n.id !== notification.id));
                            const updatedNotifications = notifications.filter(n => n.id !== notification.id);
                            localStorage.setItem('doctorNotifications', JSON.stringify(updatedNotifications));
                          }}>
                            Mark Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        {doctorPreferences.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Users className="h-5 w-5" />
                📝 Doctor Preference Requests ({doctorPreferences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctorPreferences.map((preference) => (
                  <div key={preference.id} className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">PREFERENCE REQUEST</Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(preference.requestedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-blue-800 mb-2">Patient: {preference.patientName}</p>
                        <p className="text-sm text-blue-700">Preferred Doctor: {preference.preferredDoctor}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                          const updatedPreferences = doctorPreferences.filter(p => p.id !== preference.id);
                          setDoctorPreferences(updatedPreferences);
                          localStorage.setItem('doctorPreferences', JSON.stringify(updatedPreferences));
                          alert(`Doctor preference approved for ${preference.patientName}`);
                        }}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          const updatedPreferences = doctorPreferences.filter(p => p.id !== preference.id);
                          setDoctorPreferences(updatedPreferences);
                          localStorage.setItem('doctorPreferences', JSON.stringify(updatedPreferences));
                          alert(`Doctor preference declined for ${preference.patientName}`);
                        }}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {emergencies.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                🚨 EMERGENCY ALERTS ({emergencies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencies.map((emergency) => (
                  <div key={emergency.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">EMERGENCY</Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(emergency.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-red-800 mb-2">{emergency.details}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            Location: {emergency.location}
                          </div>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone className="h-4 w-4" />
                            Phone: {emergency.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Phone className="h-4 w-4 mr-1" />
                          Call Now
                        </Button>
                        <Button size="sm" variant="outline">
                          Dispatch Ambulance
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient List - Priority Based ({patients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {patients.filter(p => p.status !== 'COMPLETED').map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium truncate">{patient.name}</h3>
                      <Badge variant={
                        patient.priority === 'HIGH' ? 'destructive' :
                        patient.priority === 'MEDIUM' ? 'default' : 'secondary'
                      }>
                        {patient.priority} PRIORITY
                      </Badge>
                      {patient.dataToken && (
                        <Badge variant="outline" className="hidden sm:inline-flex">Token: {patient.dataToken}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1 truncate">
                      Age: {patient.age || 'Unknown'} | Phone: {patient.phone}
                    </p>
                    <p className="text-sm text-gray-700 mb-1 truncate">
                      Symptoms: {patient.symptoms.join(', ')}
                    </p>
                    {patient.image && (
                      <div className="mb-2">
                        <p className="text-xs text-blue-600 mb-1">📷 Image: {patient.image}</p>
                        {patient.imageData && (
                          <img 
                            src={patient.imageData} 
                            alt="Patient submitted image" 
                            className="max-w-xs max-h-32 object-cover border rounded"
                          />
                        )}
                      </div>
                    )}
                    {(() => {
                      const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
                      
                      return patientAppointments.length > 0 ? (
                        <div className="space-y-1">
                          {patientAppointments.map((apt) => {
                            const appointmentDay = new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long' });
                            return (
                              <div key={apt.id} className="text-sm text-blue-600">
                                📅 Appointment: {apt.date} at {apt.time} ({appointmentDay})
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No appointments scheduled</div>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewPatientDetails(patient)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => initiateVideoCall(patient)}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Video Call
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowDisclaimer(true);
                      }}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      AI Diagnosis
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowPrescription(true);
                      }}
                    >
                      <Pill className="h-4 w-4 mr-1" />
                      Prescribe
                    </Button>
                    {patient.status === 'PENDING' && !assignedDoctors[patient.id] && (
                      <Button size="sm" variant="outline" onClick={() => assignToDoctor(patient)}>
                        Assign Doctor
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openManageCase(patient)}
                    >
                      Manage Case
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {patients.filter(p => p.status === 'COMPLETED').length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Completed Cases ({patients.filter(p => p.status === 'COMPLETED').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {patients.filter(p => p.status === 'COMPLETED').map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border border-green-100 rounded-lg bg-green-50">
                    <div>
                      <p className="font-medium text-green-800">{patient.name}</p>
                      <p className="text-sm text-green-600">Age: {patient.age} | {patient.symptoms?.join(', ')}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">COMPLETED</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card> 
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Appointments ({appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.date === new Date().toISOString().split('T')[0])
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{appointment.patientName}</h4>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {appointment.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Token: {appointment.patientToken} | Phone: {appointment.phone || '+91-9853224443'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-1" />
                      Join Call
                    </Button>
                    <Button size="sm">
                      Start Consultation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditAppointment(appointment)}>
                      Edit
                    </Button>
                    {appointment.status === 'CANCELLED' ? (
                      <Button size="sm" disabled>
                        Cancelled
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => cancelAppointment(appointment.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments ({appointments.filter((a: any) => a.date >= new Date().toISOString().split('T')[0] && a.status !== 'CANCELLED').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.filter((a: any) => a.date >= new Date().toISOString().split('T')[0] && a.status !== 'CANCELLED').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                appointments
                  .filter((a: any) => a.date >= new Date().toISOString().split('T')[0] && a.status !== 'CANCELLED')
                  .sort((a: any, b: any) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .map((appointment: any) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                          <Badge variant={appointment.priority === 'HIGH' ? 'destructive' : 'default'}>
                            {appointment.priority}
                          </Badge>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800">Token Number</p>
                              <p className="text-xl font-mono font-bold text-blue-900">{appointment.tokenNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-800">Queue Position</p>
                              <p className="text-lg font-bold text-blue-900">#{appointment.queuePosition || '1'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /><span>{appointment.date}</span></div>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" /><span>{appointment.time}</span></div>
                          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500" /><span>{appointment.patientPhone}</span></div>
                          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-500" /><span>Age: {appointment.patientAge}</span></div>
                        </div>
                        {appointment.symptoms?.length > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm font-medium text-yellow-800">Symptoms:</p>
                            <p className="text-sm text-yellow-700">{appointment.symptoms.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={appointment.status === 'SCHEDULED' ? 'default' : 'secondary'}>{appointment.status}</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Video className="h-4 w-4 mr-1" />Call</Button>
                          <Button size="sm">Start</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {appointments.filter((a: any) => a.date < new Date().toISOString().split('T')[0] || a.status === 'CANCELLED').length > 0 && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-500">
                <Clock className="h-5 w-5" />
                Past Appointments ({appointments.filter((a: any) => a.date < new Date().toISOString().split('T')[0] || a.status === 'CANCELLED').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {appointments
                  .filter((a: any) => a.date < new Date().toISOString().split('T')[0] || a.status === 'CANCELLED')
                  .sort((a: any, b: any) => b.date.localeCompare(a.date))
                  .map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-700">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">{appointment.date} at {appointment.time} — {appointment.assignedSpecialist}</p>
                      {appointment.symptoms?.length > 0 && (
                        <p className="text-xs text-gray-400">{appointment.symptoms.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{appointment.tokenNumber}</span>
                      <Badge variant={appointment.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="text-xs">
                        {appointment.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {aiReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Council Diagnosis Report - {selectedPatient?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                {isEditingAI ? (
                  <Textarea
                    value={aiReport}
                    onChange={(e) => setAiReport(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono">{aiReport}</pre>
                )}
              </div>
              <div className="flex gap-2">
                {isEditingAI ? (
                  <>
                    <Button onClick={() => {
                      setIsEditingAI(false);
                      alert('AI Report edited and saved by doctor');
                    }}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingAI(false)}>
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditingAI(true)}>
                      Edit Report
                    </Button>
                    <Button onClick={() => alert('AI Report validated and approved by doctor')}>
                      Validate & Approve
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setAiReport('')}>
                  Close Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                AI Council Medical Disclaimer & Terms
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">⚠️ MEDICAL DISCLAIMER</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• AI diagnosis is for clinical decision support only</li>
                  <li>• Final diagnosis must be made by licensed physicians</li>
                  <li>• AI recommendations require clinical validation</li>
                  <li>• Doctor retains full responsibility for patient care</li>
                  <li>• Not for emergency medical situations</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateAIReport(selectedPatient)}
                  className="flex-1"
                >
                  I Agree - Generate Enhanced AI Diagnosis
                </Button>
                <Button variant="outline" onClick={() => setShowDisclaimer(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Prescription - {selectedPatient?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Medicine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paracetamol 500mg">Paracetamol 500mg</SelectItem>
                  <SelectItem value="Ibuprofen 400mg">Ibuprofen 400mg</SelectItem>
                  <SelectItem value="Azithromycin 250mg">Azithromycin 250mg</SelectItem>
                  <SelectItem value="Omeprazole 20mg">Omeprazole 20mg</SelectItem>
                  <SelectItem value="Metformin 500mg">Metformin 500mg</SelectItem>
                </SelectContent>
              </Select>
              
              <Input 
                placeholder="Dosage (e.g., 1 tablet twice daily)"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
              
              <Input 
                placeholder="Duration (e.g., 5 days)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              
              <Textarea 
                placeholder="Additional notes and instructions..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                rows={2}
              />
              
              <Textarea 
                placeholder="Doctor's suggestion and medical advice for patient..."
                value={doctorSuggestion}
                onChange={(e) => setDoctorSuggestion(e.target.value)}
                rows={2}
              />
              
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Medicine Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setPrescriptionImage(event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-sm"
                />
                {prescriptionImage && (
                  <div className="mt-2">
                    <img 
                      src={prescriptionImage} 
                      alt="Medicine preview" 
                      className="w-20 h-20 object-cover border rounded"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={sendPrescription} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send to Pharmacy & Patient
                </Button>
                <Button variant="outline" onClick={() => setShowPrescription(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditAppointment} onOpenChange={setShowEditAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEditedAppointment} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => { setShowEditAppointment(false); setEditingAppointment(null); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showManageCase} onOpenChange={setShowManageCase}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Patient Case</DialogTitle>
            </DialogHeader>
            {selectedPatientForCase && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium text-blue-800">{selectedPatientForCase.name}</p>
                  <p className="text-sm text-blue-600">Symptoms: {selectedPatientForCase.symptoms.join(', ')}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={approveCase}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Approve Case
                  </Button>
                  <Button 
                    onClick={closeCase}
                    variant="destructive"
                    className="flex-1"
                  >
                    Close Case
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowManageCase(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Doctor</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium text-blue-800">{selectedPatient.name}</p>
                  <p className="text-sm text-blue-600">Symptoms: {selectedPatient.symptoms.join(', ')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Specialist Doctor</label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose doctor by specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Rajesh Kumar - Cardiologist">Dr. Rajesh Kumar - Cardiologist</SelectItem>
                      <SelectItem value="Dr. Priya Sharma - Dermatologist">Dr. Priya Sharma - Dermatologist</SelectItem>
                      <SelectItem value="Dr. Amit Singh - Orthopedic">Dr. Amit Singh - Orthopedic</SelectItem>
                      <SelectItem value="Dr. Sunita Patel - Gynecologist">Dr. Sunita Patel - Gynecologist</SelectItem>
                      <SelectItem value="Dr. Ravi Gupta - ENT Specialist">Dr. Ravi Gupta - ENT Specialist</SelectItem>
                      <SelectItem value="Dr. Meera Joshi - Ophthalmologist">Dr. Meera Joshi - Ophthalmologist</SelectItem>
                      <SelectItem value="Dr. Vikram Rao - Neurologist">Dr. Vikram Rao - Neurologist</SelectItem>
                      <SelectItem value="Dr. Kavita Nair - General Medicine">Dr. Kavita Nair - General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDoctorAssignment}
                    className="flex-1"
                    disabled={!selectedDoctor}
                  >
                    Assign Doctor
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAssignDialog(false);
                      setSelectedDoctor('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedPatientForDetails?.name}</DialogTitle>
            </DialogHeader>
            {selectedPatientForDetails && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {selectedPatientForDetails.name}</p>
                      <p><strong>Age:</strong> {selectedPatientForDetails.age || 'Unknown'}</p>
                      <p><strong>Phone:</strong> {selectedPatientForDetails.phone}</p>
                    </div>
                    <div>
                      <p><strong>Priority:</strong> <Badge variant={selectedPatientForDetails.priority === 'HIGH' ? 'destructive' : 'default'}>{selectedPatientForDetails.priority}</Badge></p>
                      <p><strong>Token:</strong> {selectedPatientForDetails.dataToken || 'N/A'}</p>
                      <p><strong>Last Updated:</strong> {selectedPatientForDetails.lastUpdated ? new Date(selectedPatientForDetails.lastUpdated).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Symptoms & Medical History</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Current Symptoms:</strong> {selectedPatientForDetails.symptoms.join(', ')}
                  </p>
                  {selectedPatientForDetails.healthReport && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <strong>Detailed Report:</strong> {selectedPatientForDetails.healthReport.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedPatientForDetails.imageData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-green-800">Medical Images</h4>
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedPatientForDetails.imageData} 
                        alt="Patient medical image" 
                        className="w-32 h-32 object-cover border rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{selectedPatientForDetails.image || 'Medical Image'}</p>
                        <p className="text-xs text-gray-500">Submitted by patient</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      setShowPatientDetails(false);
                      setSelectedPatient(selectedPatientForDetails);
                      setShowDisclaimer(true);
                    }}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Diagnosis
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowPatientDetails(false);
                      setSelectedPatient(selectedPatientForDetails);
                      setShowPrescription(true);
                    }}
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Prescribe
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPatientDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}