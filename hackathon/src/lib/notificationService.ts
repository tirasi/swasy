interface Notification {
  id: string;
  type: 'PATIENT_REQUEST' | 'WEEKLY_REPORT' | 'APPOINTMENT' | 'EMERGENCY';
  message: string;
  patientId?: string;
  reportId?: string;
  timestamp: string;
  seen: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    const stored = sessionStorage.getItem('notifications');
    this.notifications = stored ? JSON.parse(stored) : [];
  }

  private saveNotifications() {
    sessionStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notifyListeners();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'seen'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      seen: false
    };
    this.notifications.unshift(newNotification);
    this.saveNotifications();
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnseenCount(): number {
    return this.notifications.filter(n => !n.seen).length;
  }

  markAsSeen(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.seen = true;
      this.saveNotifications();
    }
  }

  markAllAsSeen() {
    this.notifications.forEach(n => n.seen = true);
    this.saveNotifications();
  }

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  onNotificationsChange(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }
}

export const notificationService = new NotificationService();
export type { Notification };
