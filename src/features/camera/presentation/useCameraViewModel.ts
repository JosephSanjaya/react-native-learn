import { useCallback, useReducer, useEffect, useMemo } from 'react';
import { CameraViewModel } from './CameraViewModel.ts';
import { useServices } from '../../../core/di/context/ServiceContext.tsx';

export function useCameraViewModel() {
  const { cameraUseCase } = useServices();

  const viewModel = useMemo(() => {
    return new CameraViewModel(
      cameraUseCase,
      (action) => dispatch(action)
    );
  }, [cameraUseCase]);

  const [state, dispatch] = useReducer(
    (currentState, action) => viewModel.reducer(currentState, action),
    viewModel.getInitialState()
  );

  useEffect(() => {
    viewModel.initializeCamera();
    
    return () => {
      viewModel.cleanup();
    };
  }, [viewModel]);

  const initializeCamera = useCallback(() => viewModel.initializeCamera(), [viewModel]);
  const requestCameraPermission = useCallback(() => viewModel.requestCameraPermission(), [viewModel]);
  const startScanning = useCallback(() => viewModel.startScanning(), [viewModel]);
  const stopScanning = useCallback(() => viewModel.stopScanning(), [viewModel]);
  const clearBarcodeHistory = useCallback(() => viewModel.clearBarcodeHistory(), [viewModel]);
  const hideBarcodeDialog = useCallback(() => viewModel.hideBarcodeDialog(), [viewModel]);
  const clearError = useCallback(() => viewModel.clearError(), [viewModel]);

  return {
    state,
    actions: {
      initializeCamera,
      requestCameraPermission,
      startScanning,
      stopScanning,
      clearBarcodeHistory,
      hideBarcodeDialog,
      clearError,
    },
  };
}