import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { IFCMService, FCMMessage } from './interfaces/IFCMService';
import { IFCMTokenRepository } from '../data/repositories/interfaces/IFCMTokenRepository';

export class FCMService implements IFCMService {
  private fcmTokenRepository: IFCMTokenRepository;

  constructor(fcmTokenRepository: IFCMTokenRepository) {
    this.fcmTokenRepository = fcmTokenRepository;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing FCM service...');
      const authStatus = await messaging().requestPermission();
      console.log('FCM permission status:', authStatus);
      
      const token = await messaging().getToken();
      if (token) {
        await this.fcmTokenRepository.saveToken(token);
        console.log('FCM Token saved:', token.substring(0, 20) + '...');
      } else {
        console.warn('No FCM token received');
      }
    } catch (error) {
      console.error('FCM initialization error:', error);
      throw new Error(`Failed to initialize FCM service: ${error}`);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      console.log('Getting FCM token...');
      const token = await messaging().getToken();
      if (token) {
        await this.fcmTokenRepository.saveToken(token);
        console.log('FCM token retrieved successfully');
      }
      return token;
    } catch (error) {
      console.error('Get FCM token error:', error);
      throw new Error(`Failed to get FCM token: ${error}`);
    }
  }

  onTokenRefresh(callback: (token: string) => void): () => void {
    const unsubscribe = messaging().onTokenRefresh(async (token) => {
      await this.fcmTokenRepository.saveToken(token);
      callback(token);
    });

    return unsubscribe;
  }

  onMessage(callback: (message: FCMMessage) => void): () => void {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const fcmMessage: FCMMessage = {
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
        to: remoteMessage.to,
        collapseKey: remoteMessage.collapseKey,
        data: remoteMessage.data,
        notification: remoteMessage.notification ? {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          imageUrl: remoteMessage.notification.android?.imageUrl || remoteMessage.notification.ios?.attachments?.[0]?.url,
        } : undefined,
      };
      callback(fcmMessage);
    });

    return unsubscribe;
  }

  onBackgroundMessage(callback: (message: FCMMessage) => void): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      const fcmMessage: FCMMessage = {
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
        to: remoteMessage.to,
        collapseKey: remoteMessage.collapseKey,
        data: remoteMessage.data,
        notification: remoteMessage.notification ? {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          imageUrl: remoteMessage.notification.android?.imageUrl || remoteMessage.notification.ios?.attachments?.[0]?.url,
        } : undefined,
      };
      callback(fcmMessage);
    });
  }

  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
    } catch (error) {
      throw new Error(`Failed to subscribe to topic ${topic}: ${error}`);
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
    } catch (error) {
      throw new Error(`Failed to unsubscribe from topic ${topic}: ${error}`);
    }
  }
}