import PushNotification from 'react-native-push-notification';
import { INotificationService, NotificationData } from './interfaces/INotificationService';
import { PermissionsAndroid } from 'react-native';

export class NotificationService implements INotificationService {
  private notificationIds: Set<string> = new Set();

  initializePushNotification(): void {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('Push notification token registered:', token);
      },
      onNotification: function (notification) {
        console.log('Push notification received:', notification);
      },
      onAction: function (notification) {
        console.log('Push notification action:', notification.action);
        console.log('Push notification data:', notification);
      },
      onRegistrationError: function (err) {
        console.error('Push notification registration error:', err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    this.createNotificationChannel('default', 'Default Channel');
    console.log('Push notification service initialized');
  }

  async showNotification(notification: NotificationData): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.notificationIds.has(notification.id)) {
          console.log(`Notification with id ${notification.id} already exists, skipping duplicate`);
          resolve();
          return;
        }

        console.log('Showing notification:', notification.title);
        this.notificationIds.add(notification.id);

        PushNotification.localNotification({
          id: notification.id,
          title: notification.title,
          message: notification.body,
          channelId: notification.channelId || 'default',
          priority: notification.priority || 'default',
          userInfo: notification.data || {},
          playSound: true,
          soundName: 'default',
          vibrate: true,
          autoCancel: true,
          largeIcon: 'ic_launcher',
          smallIcon: 'ic_notification',
          bigText: notification.body,
          subText: 'Local Notification',
          color: 'blue',
          vibration: 300,
          ongoing: false,
          invokeApp: true,
          when: null,
          usesChronometer: false,
          timeoutAfter: null,
          allowWhileIdle: true,
          foreground: true,
        });

        console.log('Notification scheduled successfully');
        resolve();
      } catch (error) {
        console.error('Error showing notification:', error);
        reject(error);
      }
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    return new Promise((resolve) => {
      PushNotification.cancelLocalNotification(notificationId);
      this.notificationIds.delete(notificationId);
      resolve();
    });
  }

  async cancelAllNotifications(): Promise<void> {
    return new Promise((resolve) => {
      PushNotification.cancelAllLocalNotifications();
      this.notificationIds.clear();
      resolve();
    });
  }

  async createNotificationChannel(channelId: string, channelName: string, importance: number = 4): Promise<void> {
    return new Promise((resolve) => {
      PushNotification.createChannel(
        {
          channelId: channelId,
          channelName: channelName,
          channelDescription: `A channel for ${channelName}`,
          playSound: true,
          soundName: 'default',
          importance: importance,
          vibrate: true,
        },
        (created) => {
          console.log(`Notification channel '${channelId}' created: ${created}`);
          resolve();
        }
      );
    });
  }

  async checkNotificationPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        PushNotification.checkPermissions((permissions) => {
          console.log('Current notification permissions:', permissions);
          if (permissions && typeof permissions === 'object') {
            const hasPermissions = permissions.alert && permissions.badge && permissions.sound;
            resolve(hasPermissions);
          } else {
            console.warn('Invalid permissions object received');
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Error checking permissions:', error);
        resolve(false);
      }
    });
  }

  async requestNotificationPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        PushNotification.requestPermissions((permissions) => {
          console.log('Requested notification permissions:', permissions);
          if (permissions && typeof permissions === 'object') {
            const hasPermissions = permissions.alert && permissions.badge && permissions.sound;
            resolve(hasPermissions);
          } else {
            console.warn('Invalid permissions object received from request');
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Error requesting permissions:', error);
        resolve(false);
      }
    });
  }
}