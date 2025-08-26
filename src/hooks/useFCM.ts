import { useServices } from '../context/ServiceContext';

export const useFCM = () => {
  const { fcmService } = useServices();
  return fcmService;
};