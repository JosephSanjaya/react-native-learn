import { INotificationService } from './INotificationService.ts';
import { IPermissionService } from './IPermissionService.ts';
import { PermissionStatus } from './IPermissionService.ts';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export class NotificationManager {
  constructor(
    private notificationService: INotificationService,
    private permissionService: IPermissionService
  ) {}

  async requestPermissionWithFeedback(): Promise<PermissionStatus> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('POST_NOTIFICATIONS permission:', granted);
      }
      const status = await this.permissionService.requestNotificationPermission();
      if (status === PermissionStatus.GRANTED) {
        Alert.alert('Success', 'Notification permission granted!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in settings');
      }
      return status;
    } catch (error) {
      Alert.alert('Error', `Failed to request permission: ${error}`);
      throw error;
    }
  }

  async sendTestNotification(): Promise<void> {
    try {
      console.log('Sending simple test notification without permission checks...');

      const notificationId = `simple_test_${Date.now()}`;

      await this.notificationService.showNotification({
        id: notificationId,
        title: 'Simple Test',
        body: 'Simple test notification without permission checks',
        channelId: 'default',
        priority: 'high',
      });

      console.log('Simple test notification sent');
    } catch (error) {
      console.error('Error sending simple test notification:', error);
      throw error;
    }
  }

  getPermissionStatusColor(status: PermissionStatus | null): string {
    switch (status) {
      case PermissionStatus.GRANTED:
        return '#4CAF50';
      case PermissionStatus.DENIED:
        return '#F44336';
      case PermissionStatus.BLOCKED:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  }
}