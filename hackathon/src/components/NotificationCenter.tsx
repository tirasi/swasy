import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Calendar, Pill, User, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { syncService } from '@/lib/syncService';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  read?: boolean;
  patientId?: string;
  appointmentId?: string;
  prescriptionId?: string;
  targetRole?: string;
}

interface NotificationCenterProps {
  userRole?: 'patient' | 'doctor' | 'pharmacy' | 'admin';
  userId?: string;
}

export function NotificationCenter({ userRole = 'doctor', userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load existing notifications
    loadNotifications();

    // Subscribe to real-time notifications
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      
      // Filter notifications by user role if specified
      if (notification.targetRole && notification.targetRole !== userRole) {
        return;
      }

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationsUpdate = (event: CustomEvent) => {
      const updatedNotifications = event.detail;
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    };

    // Subscribe to sync service events
    syncService.subscribe('newNotification', handleNewNotification);
    syncService.subscribe('notificationsUpdated', handleNotificationsUpdate);

    // Also listen to window events for backward compatibility
    window.addEventListener('newNotification', handleNewNotification as EventListener);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate as EventListener);

    return () => {
      syncService.unsubscribe('newNotification', handleNewNotification);
      syncService.unsubscribe('notificationsUpdated', handleNotificationsUpdate);
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate as EventListener);
    };
  }, [userRole]);

  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filtered = stored.filter((notif: Notification) => 
      !notif.targetRole || notif.targetRole === userRole
    );
    setNotifications(filtered);
    updateUnreadCount(filtered);
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const unread = notifs.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    
    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedAll = allNotifications.map((n: Notification) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedAll));
    
    updateUnreadCount(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    
    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedAll = allNotifications.map((n: Notification) => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updatedAll));
    
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    
    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedAll = allNotifications.filter((n: Notification) => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(updatedAll));
    
    updateUnreadCount(updated);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_UPDATE':
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_CONFIRMED':
        return <Calendar className="h-4 w-4" />;
      case 'NEW_PRESCRIPTION':
      case 'PRESCRIPTION_READY':
        return <Pill className="h-4 w-4" />;
      case 'PATIENT_REQUEST':
      case 'NEW_PATIENT_REPORT':
        return <User className="h-4 w-4" />;
      case 'EMERGENCY':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {notification.title}
                              </h4>
                              <Badge 
                                variant={getPriorityColor(notification.priority)} 
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}