import { useCallback, useReducer, useEffect, useMemo } from 'react';
import { AppViewModel } from '../../AppViewModel';
import { useServices } from '../context/ServiceContext';
import { useBackgroundSync } from './useBackgroundSync';
import { useAppInitialization } from './useAppInitialization';
import { useConsoleLogger } from './useConsoleLogger';

export function useAppViewModel() {
  const services = useServices();
  const backgroundSyncService = useBackgroundSync();
  const appInitialization = useAppInitialization();
  const consoleLogger = useConsoleLogger();

  const viewModel = useMemo(() => {
    return new AppViewModel(
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