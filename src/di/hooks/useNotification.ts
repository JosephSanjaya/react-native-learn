import { useServices } from '../context/ServiceContext.tsx';

export const useNotification = () => {
  const { notificationService } = useServices();
  return notificationService;
};