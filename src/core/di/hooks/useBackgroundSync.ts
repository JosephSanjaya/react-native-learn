import { useServices } from '../context/ServiceContext.tsx';

export const useBackgroundSync = () => {
  const { backgroundSyncService } = useServices();
  return backgroundSyncService;
};