import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { notificationService, Notification } from '@/lib/notificationService';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
      setUnseenCount(notificationService.getUnseenCount());
    };

    updateNotifications();
    const unsubscribe = notificationService.onNotificationsChange(updateNotifications);

    return unsubscribe;
  }, []);

  const handleBellClick = () => {
    setShowDialog(true);
    notificationService.markAllAsSeen();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'WEEKLY_REPORT' && notification.reportId) {
      navigate(`/reports?id=${notification.reportId}`);
      notificationService.removeNotification(notification.id);
      setShowDialog(false);
    } else if (notification.type === 'PATIENT_REQUEST' && notification.patientId) {
      navigate(`/doctor-dashboard?patientId=${notification.patientId}`);
      notificationService.removeNotification(notification.id);
      setShowDialog(false);
    }
  };

  return (
    <>
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={handleBellClick}>
          <Bell className="h-5 w-5" />
          {unseenCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unseenCount}
            </Badge>
          )}
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    !notification.seen ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        notificationService.removeNotification(notification.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                notificationService.clearAll();
                setShowDialog(false);
              }}
            >
              Clear All
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
