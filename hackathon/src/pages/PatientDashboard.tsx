import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { User, Shield, Clock, FileText, Mic, MicOff, Camera, Send, Calendar, Volume2, VolumeX, Star, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataService } from '@/lib/dataService';
import { routingService } from '@/lib/routingService';
import { syncService } from '@/lib/syncService';
import { authService } from '@/lib/auth';
import { AppointmentBooking } from '@/components/AppointmentBooking';
import { NotificationCenter } from '@/components/NotificationCenter';
import { aiAgent } from '@/lib/aiAgent';
import { voiceRecognitionService } from '@/lib/voiceRecognitionService';
import { usePatient } from '@/hooks/usePatient';

export default function PatientDashboard() {
  const patient = usePatient();
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthInput, setHealthInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('hi-IN');
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
    setIsVoiceSupported(voiceRecognitionService.isSupported());

    const loadData = async () => {
      try {
        const appointmentsData = await dataService.getAppointments();
        setAppointments(appointmentsData.filter((apt: any) => apt.patientId === patient?.id));

        const doctorReports = [
          { id: 'RPT001', patientId: '1', doctorId: 'd1', status: 'COMPLETED', date: '2024-01-15', content: 'Initial consultation completed', type: 'DOCTOR' },
          { id: 'RPT002', patientId: '1', doctorId: 'd1', status: 'PENDING', date: '2024-01-16', content: 'Follow-up required', type: 'DOCTOR' },
        ];
        const rawHealthReports = await dataService.getHealthReports(patient?.id);
        const healthReports = rawHealthReports.map((r: any) => ({
          id: r.id,
          patientId: r.patientId,
          status: r.status || 'SUBMITTED',
          date: (r.timestamp || new Date().toISOString()).split('T')[0],
          content: r.description,
          type: 'HEALTH',
          image: r.image,
        }));

        const approvedReports = JSON.parse(localStorage.getItem('approvedReports') || '[]')
          .filter((r: any) => r.patientId === patient?.id)
          .map((r: any) => ({
            id: r.id,
            patientId: r.patientId,
            doctorId: r.doctorId,
            status: r.status || 'DOCTOR_APPROVED',
            date: (r.approvedAt || r.createdAt || new Date().toISOString()).split('T')[0],
            content: r.final_report || r.content || r.report || '',
            type: 'DOCTOR',
            approvedAt: r.approvedAt,
          }));

        setReports([...doctorReports, ...approvedReports, ...healthReports]);
      } catch (e) {
        console.error('Failed to load appointments/reports:', e);
      }
      setLoading(false);
    };

    loadData();

    const handleAppointmentsUpdate = (event: any) => {
      const data = event?.detail;
      if (Array.isArray(data)) {
        setAppointments(data.filter((a: any) => a.patientId === patient?.id));
      } else {
        dataService.getAppointments().then(all =>
          setAppointments(all.filter((a: any) => a.patientId === patient?.id))
        );
      }
    };
    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdate);

    const handleReportApproved = (event: any) => {
      const report = event?.detail;
      if (!report || report.patientId !== patient?.id) {
        return;
      }

      const mappedReport = {
        id: report.id,
        patientId: report.patientId,
        doctorId: report.doctorId,
        status: report.status || 'DOCTOR_APPROVED',
        date: (report.approvedAt || new Date().toISOString()).split('T')[0],
        content: report.final_report || report.content || report.report || '',
        type: 'DOCTOR',
        approvedAt: report.approvedAt,
      };

      setReports((prev) => {
        const withoutExisting = prev.filter((item: any) => item.id !== mappedReport.id);
        return [mappedReport, ...withoutExisting];
      });
    };

    window.addEventListener('reportApproved', handleReportApproved);

    return () => {
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdate);
      window.removeEventListener('reportApproved', handleReportApproved);
      if (isRecording) voiceRecognitionService.stopListening();
    };
  }, [patient?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Portal</h1>
            <p className="text-muted-foreground">Secure access to your medical information</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter userRole="patient" userId={patient?.id} />
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              HIPAA Compliant
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg">Welcome to your secure patient portal, <strong>{patient?.name}</strong>!</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Age: {patient?.age}</p>
                      <p className="font-medium">Phone: {patient?.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status: <Badge variant="outline">{patient?.status}</Badge></p>
                      {patient?.dataToken && (
                        <p className="font-medium">
                          Data Token: 
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {patient.dataToken.substr(0, 8)}...
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Current Symptoms:</strong> {patient?.symptoms?.join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Report Your Health Status</CardTitle>
                  <Button
                    variant={voiceEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (!isVoiceSupported) {
                        alert('⚠️ Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice features.');
                        return;
                      }
                      
                      setVoiceEnabled(!voiceEnabled);
                      if (voiceEnabled && isRecording) {
                        // Stop recording if disabling voice
                        setIsRecording(false);
                        setInterimText('');
                        voiceRecognitionService.stopListening();
                      }
                      console.log('Voice control toggled:', !voiceEnabled);
                    }}
                    disabled={!isVoiceSupported}
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                    {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
                    {!isVoiceSupported && <span className="ml-1 text-xs">(Not Supported)</span>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voiceEnabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-800 font-medium">
                          🎤 Voice Control Active - {currentLanguage === 'hi-IN' ? 'हिंदी' : 'English'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {isRecording ? 'Recording...' : 'Ready'}
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-600">
                        हिंदी में बोलें या अंग्रेजी में - AI automatically detects language
                      </p>
                      {interimText && (
                        <div className="mt-2 p-2 bg-white border rounded text-sm">
                          <span className="text-gray-500">Listening: </span>
                          <span className="text-blue-700">{interimText}</span>
                        </div>
                      )}
                      {!isVoiceSupported && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Voice recognition not supported in this browser. Please use Chrome or Edge.
                        </p>
                      )}
                    </div>
                  )}
                  
                  <Textarea
                    placeholder="Describe your symptoms, pain level, or any health concerns... (या हिंदी में अपने लक्षण बताएं)"
                    value={healthInput}
                    onChange={(e) => setHealthInput(e.target.value)}
                    rows={4}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={async () => {
                        if (!isVoiceSupported) {
                          alert('⚠️ Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
                          return;
                        }

                        if (isRecording) {
                          // Stop recording
                          setIsRecording(false);
                          setInterimText('');
                          voiceRecognitionService.stopListening();
                          console.log('Voice input stopped');
                        } else {
                          // Start recording
                          setIsRecording(true);
                          setCurrentLanguage(voiceRecognitionService.getCurrentLanguage());
                          
                          try {
                            await voiceRecognitionService.startListening(
                              (text, isFinal) => {
                                if (isFinal) {
                                  // Process and add final text
                                  const processedText = voiceRecognitionService.processRecognizedText(text);
                                  setHealthInput(prev => {
                                    const newText = prev ? `${prev} ${processedText}` : processedText;
                                    return newText.trim();
                                  });
                                  setInterimText('');
                                } else {
                                  // Show interim results
                                  setInterimText(text);
                                }
                              },
                              (error) => {
                                console.error('Voice recognition error:', error);
                                setIsRecording(false);
                                setInterimText('');
                                
                                let errorMessage = 'Voice recognition failed. ';
                                switch (error) {
                                  case 'not-allowed':
                                    errorMessage += 'Please allow microphone access.';
                                    break;
                                  case 'no-speech':
                                    errorMessage += 'No speech detected. Please try again.';
                                    break;
                                  case 'network':
                                    errorMessage += 'Network error. Please check your connection.';
                                    break;
                                  default:
                                    errorMessage += 'Please try again.';
                                }
                                alert(errorMessage);
                              }
                            );
                          } catch (error) {
                            console.error('Failed to start voice recognition:', error);
                            setIsRecording(false);
                            alert('⚠️ Failed to start voice recognition. Please check microphone permissions.');
                          }
                        }
                      }}
                      disabled={!isVoiceSupported}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2 animate-pulse" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Input (हिंदी/English)
                        </>
                      )}
                    </Button>
                    
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedImage(file);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  
                  {selectedImage && (
                    <div className="p-2 border rounded bg-gray-50">
                      <p className="text-sm text-gray-600">📷 Image selected: {selectedImage.name}</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={async () => {
                      if (healthInput.trim() || selectedImage) {
                        // Create patient report
                        const healthReport = {
                          id: `HR_${Date.now()}`,
                          patientId: patient.id,
                          patientName: patient.name,
                          patientToken: patient.dataToken,
                          description: healthInput,
                          image: selectedImage?.name || null,
                          timestamp: new Date().toISOString(),
                          status: 'NEW'
                        };
                        
                        // Save report to Firestore + localStorage
                        await dataService.saveHealthReport(healthReport);

                        // AI Analysis - Process report through AI agent
                        const aiAnalysis = await aiAgent.analyzePatientReport(healthReport);
                        console.log('AI Analysis sent to doctor:', aiAnalysis);
                        
                        // Sync across portals
                        syncService.syncPatient({ ...patient, reports: [...(patient.reports || []), healthReport] }, 'UPDATE');
                        
                        // Handle image if present
                        if (selectedImage) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            (healthReport as any).imageData = (e.target as any).result;
                            const updatedReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
                            const reportIndex = updatedReports.findIndex(r => r.id === healthReport.id);
                            if (reportIndex !== -1) {
                              updatedReports[reportIndex] = healthReport;
                              localStorage.setItem('healthReports', JSON.stringify(updatedReports));
                            }
                          };
                          reader.readAsDataURL(selectedImage);
                        }
                        
                        // Clear form
                        setHealthInput('');
                        setSelectedImage(null);
                        
                        // Show booking dialog
                        setShowBookingDialog(true);
                      } else {
                        alert('Please add a description or image');
                      }
                    }}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Health Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Your Appointments ({appointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No appointments scheduled
                    </p>
                  ) : (
                    appointments.map((appointment) => (
                      <div key={appointment.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.assignedSpecialist}</p>
                            <p className="text-sm text-blue-600">{appointment.specialty}</p>
                            <p className="text-xs text-gray-500">
                              {appointment.date} at {appointment.time}
                            </p>
                          </div>
                          <Badge 
                            variant={appointment.status === 'SCHEDULED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Reports ({reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.map((report) => {
                    const doctor = assignedDoctors.find(d => d.id === report.doctorId);
                    return (
                      <div key={report.id} className="p-3 border rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              {report.type === 'HEALTH' ? 'Health Report' : `Report #${report.id}`}
                            </p>
                            <p className="text-xs text-blue-600">
                              {report.type === 'HEALTH' ? 'Submitted by you' : `By: ${doctor?.name || 'Dr. Rajesh Khanna'}`}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{report.content}</p>
                            {report.image && (
                              <p className="text-xs text-green-600 mt-1">📷 Image: {report.image}</p>
                            )}
                            <Badge 
                              variant={report.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-xs mt-2"
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{report.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• Patient: {patient?.name}</p>
                  <p>• Status: <Badge variant="outline">{patient?.status}</Badge></p>
                  <p>• Symptoms: {patient?.symptoms?.join(', ')}</p>
                  <p>• Assigned to: {assignedDoctors[0]?.name || 'Not assigned'}</p>
                  <p className="text-xs text-gray-500">Last updated: {new Date(patient?.updatedAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto" />
                  <h3 className="font-medium">Privacy Protected</h3>
                  <p className="text-xs text-gray-600">
                    Your data is encrypted and only accessible to your authorized care team.
                    Medical AI systems assist doctors but do not have direct access to your personal information.
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    🔐 Your data is tokenized with ID: {patient?.dataToken}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Health Report Submitted Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✅ Report Submitted Successfully
                </p>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Submitted to:</strong> Medical Team</p>
                  <p><strong>Status:</strong> Under Review</p>
                  <p className="text-xs mt-2 italic">Your report is being reviewed by qualified medical professionals.</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Your health report has been submitted and is being reviewed by medical professionals. 
                You can now book an appointment with our intelligent routing system.
              </p>
              
              <AppointmentBooking 
                patientData={patient}
                onAppointmentCreated={(_appointment) => {
                  // appointmentsUpdated event will update state — no direct push needed
                  setShowBookingDialog(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}