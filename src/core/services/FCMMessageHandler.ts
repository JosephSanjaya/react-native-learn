import { IFCMService } from './IFCMService.ts';
import { INotificationService } from './INotificationService.ts';
import { FCMMessage } from './IFCMService.ts';

export class FCMMessageHandler {
  private unsubscribeCallbacks: (() => void)[] = [];

  constructor(
    private fcmService: IFCMService,
    private notificationService: INotificationService
  ) {}

  setupMessageListeners(
    onMessageReceived: (message: FCMMessage) => void,
    onTokenRefresh: (token: string) => void
  ): void {
    const unsubscribeOnMessage = this.fcmService.onMessage((message: FCMMessage) => {
      console.log('Received FCM message:', message.notification?.title);
      onMessageReceived(message);

      if (message.notification) {
        this.showLocalNotificationFromFCM(
          message.notification.title || 'FCM Message',
          message.notification.body || 'You have a new message'
        );
      }
    });

    this.fcmService.onBackgroundMessage((message: FCMMessage) => {
      console.log('Received background FCM message:', message.notification?.title);
    });

    const unsubscribeTokenRefresh = this.fcmService.onTokenRefresh((token: string) => {
      console.log('FCM Token refreshed');
      onTokenRefresh(token);
    });

    this.unsubscribeCallbacks.push(unsubscribeOnMessage, unsubscribeTokenRefresh);
  }

  private async showLocalNotificationFromFCM(title: string, body: string): Promise<void> {
    try {
      const notificationId = `fcm_notification_${Date.now()}`;
      await this.notificationService.showNotification({
        id: notificationId,
        title,
        body,
        channelId: 'default',
        priority: 'high',
      });
    } catch (error) {
      console.error('Error showing FCM notification:', error);
    }
  }

  cleanup(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
  }
}