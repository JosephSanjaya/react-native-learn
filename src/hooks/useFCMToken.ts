import { useServices } from '../context/ServiceContext';

export const useFCMToken = () => {
  const { fcmTokenRepository } = useServices();
  return fcmTokenRepository;
};