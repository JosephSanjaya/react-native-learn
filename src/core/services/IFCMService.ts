import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export interface FCMMessage {
  messageId?: string;
  from?: string;
  to?: string;
  collapseKey?: string;
  data?: Record<string, string>;
  notification?: {
    title?: string;
    body?: string;
    imageUrl?: string;
  };
}

export interface IFCMService {
  initialize(): Promise<void>;
  getToken(): Promise<string | null>;
  onTokenRefresh(callback: (token: string) => void): () => void;
  onMessage(callback: (message: FCMMessage) => void): () => void;
  onBackgroundMessage(callback: (message: FCMMessage) => void): void;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
}