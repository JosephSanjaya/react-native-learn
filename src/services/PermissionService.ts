import messaging from '@react-native-firebase/messaging';
import { IPermissionService, PermissionStatus } from './interfaces/IPermissionService';

export class PermissionService implements IPermissionService {
  async requestNotificationPermission(): Promise<PermissionStatus> {
    try {
      const authStatus = await messaging().requestPermission();
      return this.mapFirebaseAuthStatusToPermissionStatus(authStatus);
    } catch (error) {
      throw new Error(`Failed to request notification permission: ${error}`);
    }
  }

  async checkNotificationPermission(): Promise<PermissionStatus> {
    try {
      const authStatus = await messaging().hasPermission();
      return this.mapFirebaseAuthStatusToPermissionStatus(authStatus);
    } catch (error) {
      throw new Error(`Failed to check notification permission: ${error}`);
    }
  }

  private mapFirebaseAuthStatusToPermissionStatus(authStatus: number): PermissionStatus {
    switch (authStatus) {
      case messaging.AuthorizationStatus.AUTHORIZED:
        return PermissionStatus.GRANTED;
      case messaging.AuthorizationStatus.PROVISIONAL:
        return PermissionStatus.PROVISIONAL;
      case messaging.AuthorizationStatus.DENIED:
        return PermissionStatus.DENIED;
      case messaging.AuthorizationStatus.NOT_DETERMINED:
        return PermissionStatus.DENIED;
      default:
        return PermissionStatus.BLOCKED;
    }
  }
}