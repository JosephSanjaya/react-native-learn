import { Alert } from 'react-native';
import { PermissionStatus } from '../../../services/interfaces/IPermissionService';

export type FCMMessage = {
  notification?: {
    title?: string;
    body?: string;
  };
};

export type HomeState = {
  isInitialized: boolean;
  initializationError: string | null;
  fcmToken: string | null;
  permissionStatus: PermissionStatus | null;
  permissionStatusColor: string;
  receivedMessages: FCMMessage[];
  logs: string[];
  isRequestingPermission: boolean;
  isSendingTestNotification: boolean;
  isPerformingSync: boolean;
  error: string | null;
};

export type HomeAction =
  | { type: 'INITIALIZATION_START' }
  | { type: 'INITIALIZATION_SUCCESS'; payload: { fcmToken: string | null; permissionStatus: PermissionStatus | null } }
  | { type: 'INITIALIZATION_ERROR'; payload: string }
  | { type: 'SET_PERMISSION_STATUS'; payload: PermissionStatus }
  | { type: 'ADD_FCM_MESSAGE'; payload: FCMMessage }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'REQUEST_PERMISSION_START' }
  | { type: 'REQUEST_PERMISSION_SUCCESS'; payload: PermissionStatus }
  | { type: 'REQUEST_PERMISSION_ERROR'; payload: string }
  | { type: 'SEND_TEST_NOTIFICATION_START' }
  | { type: 'SEND_TEST_NOTIFICATION_SUCCESS' }
  | { type: 'SEND_TEST_NOTIFICATION_ERROR'; payload: string }
  | { type: 'PERFORM_SYNC_START' }
  | { type: 'PERFORM_SYNC_SUCCESS' }
  | { type: 'PERFORM_SYNC_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export class HomeViewModel {
  private services: any;
  private backgroundSyncService: any;
  private appInitialization: any;
  private consoleLogger: any;
  private dispatch: (action: HomeAction) => void;

  constructor(
    services: any,
    backgroundSyncService: any,
    appInitialization: any,
    consoleLogger: any,
    dispatch: (action: HomeAction) => void
  ) {
    this.services = services;
    this.backgroundSyncService = backgroundSyncService;
    this.appInitialization = appInitialization;
    this.consoleLogger = consoleLogger;
    this.dispatch = dispatch;
  }

  getInitialState(): HomeState {
    return {
      isInitialized: false,
      initializationError: null,
      fcmToken: null,
      permissionStatus: null,
      permissionStatusColor: '#9E9E9E',
      receivedMessages: [],
      logs: [],
      isRequestingPermission: false,
      isSendingTestNotification: false,
      isPerformingSync: false,
      error: null,
    };
  }  reducer
(state: HomeState, action: HomeAction): HomeState {
    switch (action.type) {
      case 'INITIALIZATION_START':
        return { 
          ...state, 
          isInitialized: false, 
          initializationError: null,
          error: null 
        };
      case 'INITIALIZATION_SUCCESS':
        return { 
          ...state, 
          isInitialized: true, 
          fcmToken: action.payload.fcmToken,
          permissionStatus: action.payload.permissionStatus 
        };
      case 'INITIALIZATION_ERROR':
        return { 
          ...state, 
          isInitialized: false, 
          initializationError: action.payload 
        };
      case 'SET_PERMISSION_STATUS':
        return { 
          ...state, 
          permissionStatus: action.payload 
        };
      case 'ADD_FCM_MESSAGE':
        return { 
          ...state, 
          receivedMessages: [...state.receivedMessages, action.payload] 
        };
      case 'ADD_LOG':
        return { 
          ...state, 
          logs: [...state.logs, action.payload] 
        };
      case 'REQUEST_PERMISSION_START':
        return { 
          ...state, 
          isRequestingPermission: true, 
          error: null 
        };
      case 'REQUEST_PERMISSION_SUCCESS':
        return { 
          ...state, 
          isRequestingPermission: false, 
          permissionStatus: action.payload 
        };
      case 'REQUEST_PERMISSION_ERROR':
        return { 
          ...state, 
          isRequestingPermission: false, 
          error: action.payload 
        };
      case 'SEND_TEST_NOTIFICATION_START':
        return { 
          ...state, 
          isSendingTestNotification: true, 
          error: null 
        };
      case 'SEND_TEST_NOTIFICATION_SUCCESS':
        return { 
          ...state, 
          isSendingTestNotification: false 
        };
      case 'SEND_TEST_NOTIFICATION_ERROR':
        return { 
          ...state, 
          isSendingTestNotification: false, 
          error: action.payload 
        };
      case 'PERFORM_SYNC_START':
        return { 
          ...state, 
          isPerformingSync: true, 
          error: null 
        };
      case 'PERFORM_SYNC_SUCCESS':
        return { 
          ...state, 
          isPerformingSync: false 
        };
      case 'PERFORM_SYNC_ERROR':
        return { 
          ...state, 
          isPerformingSync: false, 
          error: action.payload 
        };
      case 'CLEAR_ERROR':
        return { 
          ...state, 
          error: null 
        };
      default:
        return state;
    }
  }

  computeState(state: HomeState): HomeState {
    const currentPermissionStatus = state.permissionStatus || this.appInitialization.permissionStatus;
    
    return {
      ...state,
      isInitialized: state.isInitialized || this.appInitialization.isInitialized,
      initializationError: state.initializationError || this.appInitialization.initializationError,
      fcmToken: state.fcmToken || this.appInitialization.fcmToken,
      permissionStatus: currentPermissionStatus,
      permissionStatusColor: this.services.notificationManager.getPermissionStatusColor(currentPermissionStatus),
      receivedMessages: this.appInitialization.receivedMessages,
      logs: this.consoleLogger.logs,
    };
  }

  async performManualSync(): Promise<void> {
    this.dispatch({ type: 'PERFORM_SYNC_START' });
    try {
      console.log('Manual trigger pressed');
      await this.backgroundSyncService.performSyncTask('manual');
      this.dispatch({ type: 'PERFORM_SYNC_SUCCESS' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      this.dispatch({ type: 'PERFORM_SYNC_ERROR', payload: errorMessage });
    }
  }

  async requestNotificationPermission(): Promise<void> {
    this.dispatch({ type: 'REQUEST_PERMISSION_START' });
    try {
      const status = await this.services.notificationManager.requestPermissionWithFeedback();
      this.appInitialization.setPermissionStatus(status);
      this.dispatch({ type: 'REQUEST_PERMISSION_SUCCESS', payload: status });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission request failed';
      console.error('Permission request failed:', error);
      this.dispatch({ type: 'REQUEST_PERMISSION_ERROR', payload: errorMessage });
    }
  }

  async sendTestNotification(): Promise<void> {
    this.dispatch({ type: 'SEND_TEST_NOTIFICATION_START' });
    try {
      await this.services.notificationManager.sendTestNotification();
      this.dispatch({ type: 'SEND_TEST_NOTIFICATION_SUCCESS' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test notification failed';
      console.error('Test notification failed:', error);
      this.dispatch({ type: 'SEND_TEST_NOTIFICATION_ERROR', payload: errorMessage });
    }
  }

  showFCMToken(): void {
    const fcmToken = this.appInitialization.fcmToken;
    if (fcmToken) {
      Alert.alert('FCM Token', fcmToken);
    } else {
      Alert.alert('No Token', 'FCM token not available');
    }
  }

  clearError(): void {
    this.dispatch({ type: 'CLEAR_ERROR' });
  }
}