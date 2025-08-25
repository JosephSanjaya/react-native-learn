import React, { createContext, useContext, ReactNode } from 'react';
import { IPostRepository } from '../repositories/interfaces/IPostRepository';
import { IBackgroundSyncService } from '../services/interfaces/IBackgroundSyncService';
import { PostRepository } from '../repositories/PostRepository';
import { BackgroundSyncService } from '../services/BackgroundSync';

interface ServiceContextType {
  postRepository: IPostRepository;
  backgroundSyncService: IBackgroundSyncService;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const postRepository = new PostRepository();
  const backgroundSyncService = new BackgroundSyncService(postRepository);

  const services: ServiceContextType = {
    postRepository,
    backgroundSyncService,
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