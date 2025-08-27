import { useServices } from '../context/ServiceContext';

export const useCameraUseCase = () => {
  const { cameraUseCase } = useServices();
  return cameraUseCase;
};