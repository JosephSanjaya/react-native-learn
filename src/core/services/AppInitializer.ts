import { IFCMService } from './IFCMService.ts';
import { IPermissionService } from './IPermissionService.ts';
import { IBackgroundSyncService } from './IBackgroundSyncService.ts';
import { FirebaseInitializer } from './FirebaseInitializer.ts';
import { INotificationService } from './INotificationService.ts';

export class AppInitializer {
  constructor(
    private fcmService: IFCMService,
    private permissionService: IPermissionService,
    private backgroundSyncService: IBackgroundSyncService,
    private notificationService: INotificationService,
  ) {}

  async initializeAllServices(): Promise<void> {
    try {
      await FirebaseInitializer.initialize();
      this.notificationService.initializePushNotification();
      
      await Promise.all([
        this.backgroundSyncService.configureBackgroundFetch(),
        this.initializeFCM(),
        this.checkInitialPermissionStatus()
      ]);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  private async initializeFCM(): Promise<string | null> {
    try {
      await this.fcmService.initialize();
      const token = await this.fcmService.getToken();
      if (token) {
        console.log('FCM initialized with token:', token.substring(0, 20) + '...');
      }
      return token;
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return null;
    }
  }

  private async checkInitialPermissionStatus(): Promise<void> {
    try {
      await this.permissionService.checkNotificationPermission();
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  }
}