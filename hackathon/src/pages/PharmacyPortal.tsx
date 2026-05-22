import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, CheckCircle, Package } from 'lucide-react';

export default function PharmacyPortal() {
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const pharmacyOrders = JSON.parse(localStorage.getItem('pharmacyOrders') || '[]');
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      
      setOrders(pharmacyOrders);
      setPrescriptions(allPrescriptions);
    };

    loadData();

    const handleNewOrder = (event) => {
      setOrders(prev => [event.detail, ...prev]);
    };

    window.addEventListener('newPharmacyOrder', handleNewOrder);
    
    return () => {
      window.removeEventListener('newPharmacyOrder', handleNewOrder);
    };
  }, []);

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('pharmacyOrders', JSON.stringify(updatedOrders));
    
    alert(`Order ${orderId} status updated to: ${status}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Portal</h1>
            <p className="text-muted-foreground">Manage prescriptions and medicine orders</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            {orders.length} Active Orders
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Incoming Prescription Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => {
                const prescription = prescriptions.find(p => p.id === order.prescriptionId);
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={order.status === 'RECEIVED' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(order.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium mb-2">Patient ID: {order.patientId}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          Estimated Cost: ₹{order.estimatedCost} | Time: {order.estimatedTime}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'RECEIVED' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                          >
                            Start Processing
                          </Button>
                        )}
                        {order.status === 'PROCESSING' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'READY' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                          >
                            Complete Order
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <h4 className="font-medium text-blue-800 mb-2">Medications:</h4>
                      <div className="space-y-2">
                        {order.medications.map((med, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{med.name}</span>
                            <div className="text-gray-600">
                              <span>Dosage: {med.dosage}</span>
                              <span className="ml-3">Duration: {med.duration}</span>
                              <span className="ml-3">Qty: {med.quantity || 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {order.pharmacyNotes && (
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Notes:</strong> {order.pharmacyNotes}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prescription orders received</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today's Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => new Date(o.timestamp).toDateString() === new Date().toDateString()).length}
              </div>
              <p className="text-sm text-gray-600">Received today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'PROCESSING').length}
              </div>
              <p className="text-sm text-gray-600">Currently processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ready for Pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'READY').length}
              </div>
              <p className="text-sm text-gray-600">Ready for collection</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}