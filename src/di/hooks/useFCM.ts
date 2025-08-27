import { useServices } from '../context/ServiceContext.tsx';

export const useFCM = () => {
  const { fcmService } = useServices();
  return fcmService;
};