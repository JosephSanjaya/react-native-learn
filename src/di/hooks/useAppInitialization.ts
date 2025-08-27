import { useEffect, useState } from 'react';
import { useServices } from '../context/ServiceContext.tsx';
import { AppInitializer } from '../../services/AppInitializer.ts';
import { FCMMessageHandler } from '../../services/FCMMessageHandler.ts';
import { PermissionStatus } from '../../services/interfaces/IPermissionService.ts';
import { FCMMessage } from '../../services/interfaces/IFCMService.ts';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<FCMMessage[]>([]);

  const services = useServices();

  const appInitializer = new AppInitializer(
    services.fcmService,
    services.permissionService,
    services.backgroundSyncService,
    services.notificationService,
  );

  const fcmMessageHandler = new FCMMessageHandler(
    services.fcmService,
    services.notificationService,
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await appInitializer.initializeAllServices();

        const token = await services.fcmService.getToken();
        setFcmToken(token);

        const status =
          await services.permissionService.checkNotificationPermission();
        setPermissionStatus(status);

        fcmMessageHandler.setupMessageListeners(
          (message: FCMMessage) => {
            setReceivedMessages(prev => [message, ...prev.slice(0, 2)]);
          },
          (token: string) => {
            setFcmToken(token);
          },
        );

        setIsInitialized(true);
      } catch (error) {
        setInitializationError(
          error instanceof Error ? error.message : 'Unknown error',
        );
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();

    return () => {
      fcmMessageHandler.cleanup();
    };
  }, []);

  return {
    isInitialized,
    initializationError,
    fcmToken,
    permissionStatus,
    receivedMessages,
    setPermissionStatus,
  };
};
