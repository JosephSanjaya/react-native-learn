import { useServices } from '../../../core/di/context/ServiceContext.tsx';

export const useBluetoothService = () => {
  const { bluetoothService } = useServices();
  return bluetoothService;
};

export const useBluetoothUseCase = () => {
  const { bluetoothUseCase } = useServices();
  return bluetoothUseCase;
};