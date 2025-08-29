import { useServices } from '../../../core/di/context/ServiceContext.tsx';

export const useCameraUseCase = () => {
  const { cameraUseCase } = useServices();
  return cameraUseCase;
};