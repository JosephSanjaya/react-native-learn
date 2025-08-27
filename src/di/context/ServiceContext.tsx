import React, { createContext, useContext, ReactNode } from 'react';
import { IPostRepository } from '../../data/repositories/interfaces/IPostRepository.ts';
import { IFCMTokenRepository } from '../../data/repositories/interfaces/IFCMTokenRepository.ts';
import { IBackgroundSyncService } from '../../services/interfaces/IBackgroundSyncService.ts';
import { IPermissionService } from '../../services/interfaces/IPermissionService.ts';
import { INotificationService } from '../../services/interfaces/INotificationService.ts';
import { IFCMService } from '../../services/interfaces/IFCMService.ts';
import { IBluetoothService } from '../../services/interfaces/IBluetoothService.ts';
import { IBluetoothDeviceRepository } from '../../data/repositories/interfaces/IBluetoothDeviceRepository.ts';
import { PostRepository } from '../../data/repositories/PostRepository.ts';
import { FCMTokenRepository } from '../../data/repositories/FCMTokenRepository.ts';
import { BluetoothDeviceRepository } from '../../data/repositories/BluetoothDeviceRepository.ts';
import { BackgroundSyncService } from '../../services/BackgroundSync.ts';
import { PermissionService } from '../../services/PermissionService.ts';
import { NotificationService } from '../../services/NotificationService.ts';
import { FCMService } from '../../services/FCMService.ts';
import { BluetoothService } from '../../services/BluetoothService.ts';
import { BluetoothUseCase } from '../../domain/usecases/BluetoothUseCase.ts';
import { AppInitializer } from '../../services/AppInitializer.ts';
import { FCMMessageHandler } from '../../services/FCMMessageHandler.ts';
import { NotificationManager } from '../../services/NotificationManager.ts';

interface ServiceContextType {
  postRepository: IPostRepository;
  fcmTokenRepository: IFCMTokenRepository;
  bluetoothDeviceRepository: IBluetoothDeviceRepository;
  backgroundSyncService: IBackgroundSyncService;
  permissionService: IPermissionService;
  notificationService: INotificationService;
  fcmService: IFCMService;
  bluetoothService: IBluetoothService;
  bluetoothUseCase: BluetoothUseCase;
  appInitializer: AppInitializer;
  fcmMessageHandler: FCMMessageHandler;
  notificationManager: NotificationManager;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
}) => {
  const postRepository = new PostRepository();
  const fcmTokenRepository = new FCMTokenRepository();
  const bluetoothDeviceRepository = new BluetoothDeviceRepository();
  const backgroundSyncService = new BackgroundSyncService(postRepository);
  const permissionService = new PermissionService();
  const notificationService = new NotificationService();
  const fcmService = new FCMService(fcmTokenRepository);
  const bluetoothService = new BluetoothService(bluetoothDeviceRepository);
  const bluetoothUseCase = new BluetoothUseCase(bluetoothService, bluetoothDeviceRepository);

  const appInitializer = new AppInitializer(
    fcmService,
    permissionService,
    backgroundSyncService,
    notificationService
  );
  const fcmMessageHandler = new FCMMessageHandler(
    fcmService,
    notificationService,
  );
  const notificationManager = new NotificationManager(
    notificationService,
    permissionService,
  );

  const services: ServiceContextType = {
    postRepository,
    fcmTokenRepository,
    bluetoothDeviceRepository,
    backgroundSyncService,
    permissionService,
    notificationService,
    fcmService,
    bluetoothService,
    bluetoothUseCase,
    appInitializer,
    fcmMessageHandler,
    notificationManager,
  };

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
