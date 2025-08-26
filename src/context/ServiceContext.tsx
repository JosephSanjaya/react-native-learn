import React, { createContext, useContext, ReactNode } from 'react';
import { IPostRepository } from '../repositories/interfaces/IPostRepository';
import { IFCMTokenRepository } from '../repositories/interfaces/IFCMTokenRepository';
import { IBackgroundSyncService } from '../services/interfaces/IBackgroundSyncService';
import { IPermissionService } from '../services/interfaces/IPermissionService';
import { INotificationService } from '../services/interfaces/INotificationService';
import { IFCMService } from '../services/interfaces/IFCMService';
import { PostRepository } from '../repositories/PostRepository';
import { FCMTokenRepository } from '../repositories/FCMTokenRepository';
import { BackgroundSyncService } from '../services/BackgroundSync';
import { PermissionService } from '../services/PermissionService';
import { NotificationService } from '../services/NotificationService';
import { FCMService } from '../services/FCMService';
import { AppInitializer } from '../services/AppInitializer';
import { FCMMessageHandler } from '../services/FCMMessageHandler';
import { NotificationManager } from '../services/NotificationManager';

interface ServiceContextType {
  postRepository: IPostRepository;
  fcmTokenRepository: IFCMTokenRepository;
  backgroundSyncService: IBackgroundSyncService;
  permissionService: IPermissionService;
  notificationService: INotificationService;
  fcmService: IFCMService;
  appInitializer: AppInitializer;
  fcmMessageHandler: FCMMessageHandler;
  notificationManager: NotificationManager;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const postRepository = new PostRepository();
  const fcmTokenRepository = new FCMTokenRepository();
  const backgroundSyncService = new BackgroundSyncService(postRepository);
  const permissionService = new PermissionService();
  const notificationService = new NotificationService();
  const fcmService = new FCMService(fcmTokenRepository);

  const appInitializer = new AppInitializer(fcmService, permissionService, backgroundSyncService);
  const fcmMessageHandler = new FCMMessageHandler(fcmService, notificationService);
  const notificationManager = new NotificationManager(notificationService, permissionService);

  const services: ServiceContextType = {
    postRepository,
    fcmTokenRepository,
    backgroundSyncService,
    permissionService,
    notificationService,
    fcmService,
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