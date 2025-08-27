import { useServices } from '../context/ServiceContext';

export const useBluetoothService = () => {
  const { bluetoothService } = useServices();
  return bluetoothService;
};

export const useBluetoothUseCase = () => {
  const { bluetoothUseCase } = useServices();
  return bluetoothUseCase;
};