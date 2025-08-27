import { useCallback, useReducer, useEffect, useMemo } from 'react';
import { HomeViewModel } from './HomeViewModel';
import { useServices } from '../../../di/context/ServiceContext';
import { useBackgroundSync } from '../../../di/hooks/useBackgroundSync';
import { useAppInitialization } from '../../../di/hooks/useAppInitialization';
import { useConsoleLogger } from '../../../di/hooks/useConsoleLogger';

export function useHomeViewModel() {
  const services = useServices();
  const backgroundSyncService = useBackgroundSync();
  const appInitialization = useAppInitialization();
  const consoleLogger = useConsoleLogger();

  const viewModel = useMemo(() => {
    return new HomeViewModel(
      services,
      backgroundSyncService,
      appInitialization,
      consoleLogger,
      (action) => dispatch(action)
    );
  }, [services, backgroundSyncService, appInitialization, consoleLogger]);

  const [state, dispatch] = useReducer(
    (currentState, action) => viewModel.reducer(currentState, action),
    viewModel.getInitialState()
  );

  useEffect(() => {
    if (appInitialization.isInitialized) {
      dispatch({
        type: 'INITIALIZATION_SUCCESS',
        payload: {
          fcmToken: appInitialization.fcmToken,
          permissionStatus: appInitialization.permissionStatus,
        },
      });
    } else if (appInitialization.initializationError) {
      dispatch({
        type: 'INITIALIZATION_ERROR',
        payload: appInitialization.initializationError,
      });
    }
  }, [
    appInitialization.isInitialized,
    appInitialization.initializationError,
    appInitialization.fcmToken,
    appInitialization.permissionStatus,
  ]);

  useEffect(() => {
    if (appInitialization.permissionStatus) {
      dispatch({
        type: 'SET_PERMISSION_STATUS',
        payload: appInitialization.permissionStatus,
      });
    }
  }, [appInitialization.permissionStatus]);

  const performManualSync = useCallback(() => viewModel.performManualSync(), [viewModel]);
  const requestNotificationPermission = useCallback(() => viewModel.requestNotificationPermission(), [viewModel]);
  const sendTestNotification = useCallback(() => viewModel.sendTestNotification(), [viewModel]);
  const showFCMToken = useCallback(() => viewModel.showFCMToken(), [viewModel]);
  const clearError = useCallback(() => viewModel.clearError(), [viewModel]);
  const computedState = useMemo(() => viewModel.computeState(state), [viewModel, state]);

  return {
    state: computedState,
    actions: {
      performManualSync,
      requestNotificationPermission,
      sendTestNotification,
      showFCMToken,
      clearError,
    },
  };
}