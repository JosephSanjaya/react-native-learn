import { useServices } from '../context/ServiceContext';

export const useBackgroundSync = () => {
  const { backgroundSyncService } = useServices();
  return backgroundSyncService;
};