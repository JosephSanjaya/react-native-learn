import { useCallback, useReducer, useEffect, useMemo } from 'react';
import { BluetoothViewModel } from './BluetoothViewModel';
import { useBluetoothService, useBluetoothUseCase } from '../../../di/hooks/useBluetoothService';

export function useBluetoothViewModel() {
  const bluetoothService = useBluetoothService();
  const bluetoothUseCase = useBluetoothUseCase();

  const viewModel = useMemo(() => {
    return new BluetoothViewModel(
      bluetoothService,
      bluetoothUseCase,
      (action) => dispatch(action)
    );
  }, [bluetoothService, bluetoothUseCase]);

  const [state, dispatch] = useReducer(
    (currentState, action) => viewModel.reducer(currentState, action),
    viewModel.getInitialState()
  );

  useEffect(() => {
    viewModel.initializeBluetooth();
  }, [viewModel]);

  const startScan = useCallback(() => viewModel.startScan(), [viewModel]);
  const connectToDevice = useCallback((device) => viewModel.connectToDevice(device), [viewModel]);
  const disconnectDevice = useCallback(() => viewModel.disconnectDevice(), [viewModel]);
  const printTest = useCallback(() => viewModel.printTest(), [viewModel]);
  const clearError = useCallback(() => viewModel.clearError(), [viewModel]);

  return {
    state,
    actions: {
      startScan,
      connectToDevice,
      disconnectDevice,
      printTest,
      clearError,
    },
  };
}