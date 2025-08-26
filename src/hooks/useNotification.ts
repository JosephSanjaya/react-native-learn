import { useServices } from '../context/ServiceContext';

export const useNotification = () => {
  const { notificationService } = useServices();
  return notificationService;
};