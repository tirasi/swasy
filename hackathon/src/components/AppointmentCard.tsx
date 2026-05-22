import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Phone, Stethoscope } from 'lucide-react';

interface AppointmentCardProps {
  appointment: any;
  onViewDetails?: (appointment: any) => void;
}

export function AppointmentCard({ appointment, onViewDetails }: AppointmentCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
              <Badge variant={getPriorityColor(appointment.priority)} className="text-xs">
                {appointment.priority}
              </Badge>
            </div>
            
            {/* Token Number - Prominent Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Token Number</p>
                  <p className="text-xl font-mono font-bold text-blue-900">
                    {appointment.tokenNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-800">Queue Position</p>
                  <p className="text-lg font-bold text-blue-900">
                    #{appointment.queuePosition}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{appointment.patientPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                <span>{appointment.specialty}</span>
              </div>
            </div>

            {appointment.symptoms && appointment.symptoms.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-800">Symptoms:</p>
                <p className="text-sm text-yellow-700">{appointment.symptoms.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(appointment)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}