export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
  priority?: 'high' | 'low' | 'default';
}

export interface INotificationService {
  initializePushNotification(): void;
  showNotification(notification: NotificationData): Promise<void>;
  cancelNotification(notificationId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  createNotificationChannel(channelId: string, channelName: string, importance?: number): Promise<void>;
  checkNotificationPermissions(): Promise<boolean>;
  requestNotificationPermissions(): Promise<boolean>;
}