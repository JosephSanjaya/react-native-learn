import AsyncStorage from '@react-native-async-storage/async-storage';
import { IFCMTokenRepository } from './interfaces/IFCMTokenRepository';

export class FCMTokenRepository implements IFCMTokenRepository {
  private readonly FCM_TOKEN_KEY = '@fcm_token';

  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FCM_TOKEN_KEY, token);
    } catch (error) {
      throw new Error(`Failed to save FCM token: ${error}`);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.FCM_TOKEN_KEY);
    } catch (error) {
      throw new Error(`Failed to retrieve FCM token: ${error}`);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.FCM_TOKEN_KEY);
    } catch (error) {
      throw new Error(`Failed to remove FCM token: ${error}`);
    }
  }

  async hasToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return token !== null && token.length > 0;
    } catch (error) {
      return false;
    }
  }
}