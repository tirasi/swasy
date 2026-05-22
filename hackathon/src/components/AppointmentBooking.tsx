import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Stethoscope, AlertTriangle, CheckCircle } from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { routingService } from '@/lib/routingService';

interface AppointmentBookingProps {
  patientData?: any;
  onAppointmentCreated?: (appointment: any) => void;
}

export function AppointmentBooking({ patientData, onAppointmentCreated }: AppointmentBookingProps) {
  const [formData, setFormData] = useState({
    patientName: patientData?.name || '',
    patientPhone: patientData?.phone || '',
    patientAge: patientData?.age || '',
    symptoms: patientData?.symptoms?.join(', ') || '',
    urgency: 'MEDIUM',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: ''
  });

  const [routing, setRouting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState<any>(null);

  // Auto-analyze symptoms and suggest specialist
  useEffect(() => {
    if (formData.symptoms) {
      const symptoms = formData.symptoms.split(',').map(s => s.trim()).filter(s => s);
      if (symptoms.length > 0) {
        const routingResult = routingService.routeToSpecialist(symptoms, {
          name: formData.patientName,
          age: formData.patientAge,
          phone: formData.patientPhone
        });
        setRouting(routingResult);
      }
    }
  }, [formData.symptoms, formData.patientName, formData.patientAge, formData.patientPhone]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const symptoms = formData.symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      const patient = patientData || {
        id: `patient_${Date.now()}`,
        name: formData.patientName,
        phone: formData.patientPhone,
        age: parseInt(formData.patientAge),
        symptoms,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      const appointment = routingService.createIntelligentAppointment(
        patient,
        symptoms,
        formData.urgency
      );

      const routing = routingService.routeToSpecialist(symptoms, patient);
      const suggestedTimes = routingService.getAISuggestedTimes(routing.department, routing.priority || formData.urgency, symptoms);
      appointment.routing = { ...routing, suggestedTimes };

      if (formData.preferredDate) appointment.date = formData.preferredDate;
      if (formData.preferredTime) appointment.time = formData.preferredTime;
      if (formData.additionalNotes) appointment.notes = formData.additionalNotes;

      // ── Conflict check: block if doctor already has appointment at same date+time ──
      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const conflict = existingAppointments.find((a: any) =>
        a.assignedSpecialist === appointment.assignedSpecialist &&
        a.date === appointment.date &&
        a.time === appointment.time &&
        a.status !== 'CANCELLED'
      );
      if (conflict) {
        alert(`⚠️ ${appointment.assignedSpecialist} already has an appointment at ${appointment.date} ${appointment.time}. Please choose a different time.`);
        setIsLoading(false);
        return;
      }

      // Save once — dataService handles sync + notifications internally
      const createdAppointment = await dataService.createAppointment(appointment);

      if (!createdAppointment.tokenNumber) {
        createdAppointment.tokenNumber = appointment.tokenNumber;
        createdAppointment.queuePosition = appointment.queuePosition;
      }

      // Save patient to localStorage only — skip createPatient to avoid
      // autoCreateAppointment firing a second duplicate appointment
      if (!patientData) {
        const existing = JSON.parse(localStorage.getItem('patients') || '[]');
        const alreadyExists = existing.find((p: any) => p.id === patient.id);
        if (!alreadyExists) {
          existing.push(patient);
          localStorage.setItem('patients', JSON.stringify(existing));
          window.dispatchEvent(new CustomEvent('patientsUpdated', { detail: existing }));
        }
      }

      setAppointmentCreated(createdAppointment);
      if (onAppointmentCreated) onAppointmentCreated(createdAppointment);

    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('❌ Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (appointmentCreated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Appointment Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">🎫 Appointment Confirmed!</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Patient:</span> {appointmentCreated.patientName}
              </div>
              <div>
                <span className="font-medium">Specialist:</span> {appointmentCreated.assignedSpecialist}
              </div>
              <div>
                <span className="font-medium">Date:</span> {appointmentCreated.date}
              </div>
              <div>
                <span className="font-medium">Time:</span> {appointmentCreated.time}
              </div>
              <div>
                <span className="font-medium">Specialty:</span> {appointmentCreated.specialty}
              </div>
              <div>
                <span className="font-medium">Priority:</span> 
                <Badge variant={appointmentCreated.priority === 'HIGH' ? 'destructive' : 'secondary'} className="ml-2">
                  {appointmentCreated.priority}
                </Badge>
              </div>
            </div>
            
            {/* Token Information - Prominent Display */}
            <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
              <div className="text-center">
                <h4 className="text-xl font-bold text-blue-800 mb-2">🎫 Your Token Number</h4>
                <div className="text-3xl font-mono font-bold text-blue-900 bg-white px-4 py-2 rounded border-2 border-blue-400 inline-block">
                  {appointmentCreated.tokenNumber}
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  Queue Position: <span className="font-bold">#{appointmentCreated.queuePosition}</span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Please arrive 15 minutes early and show this token number
                </p>
              </div>
            </div>
          </div>
          
          {appointmentCreated.routing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">AI Routing Analysis</h4>
              <p className="text-sm text-gray-600">{appointmentCreated.routing.reasoning}</p>
              <p className="text-xs text-gray-500 mt-1">
                Confidence: {Math.round(appointmentCreated.routing.confidence * 100)}%
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button onClick={() => setAppointmentCreated(null)}>
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient Name</label>
              <Input
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Enter patient name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                value={formData.patientPhone}
                onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <Input
                type="number"
                value={formData.patientAge}
                onChange={(e) => handleInputChange('patientAge', e.target.value)}
                placeholder="Enter age"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urgency Level</label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - Routine checkup</SelectItem>
                  <SelectItem value="MEDIUM">Medium - General concern</SelectItem>
                  <SelectItem value="HIGH">High - Urgent care needed</SelectItem>
                  <SelectItem value="CRITICAL">Critical - Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium mb-1">Symptoms</label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              placeholder="Describe symptoms (comma-separated for better analysis)"
              rows={3}
              required
            />
          </div>

          {/* AI Routing Suggestion */}
          {routing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">AI Specialist Recommendation</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Recommended Specialist:</span>
                  <Badge variant="outline">{routing.name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Specialty:</span>
                  <Badge>{routing.specialty}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Priority:</span>
                  <Badge variant={routing.priority === 'HIGH' || routing.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {routing.priority}
                  </Badge>
                </div>
                <p className="text-gray-600 italic">{routing.reasoning}</p>
                <p className="text-xs text-gray-500">
                  AI Confidence: {Math.round(routing.confidence * 100)}%
                </p>
                
                {/* AI Suggested Times */}
                {routing.suggestedTimes && routing.suggestedTimes.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <h5 className="font-medium text-green-800 mb-2">🤖 AI Suggested Optimal Times:</h5>
                    <div className="flex flex-wrap gap-2">
                      {routing.suggestedTimes.map((time, index) => (
                        <Badge 
                          key={index} 
                          variant={index === 0 ? 'default' : 'outline'}
                          className={index === 0 ? 'bg-green-600' : ''}
                        >
                          {time}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {routing.priority === 'HIGH' ? '⚡ Urgent - Immediate attention recommended' : '📅 Optimal scheduling based on symptoms and availability'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferred Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Date (Optional)</label>
              <Input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Time (Optional)</label>
              <Input
                type="time"
                value={formData.preferredTime}
                onChange={(e) => handleInputChange('preferredTime', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional information or special requests"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Booking Appointment...' : 'Book Appointment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}