import { useServices } from '../context/ServiceContext.tsx';

export const useFCMToken = () => {
  const { fcmTokenRepository } = useServices();
  return fcmTokenRepository;
};