import { CameraPermissionStatus } from '../../../services/interfaces/ICameraService';
import { BarcodeData } from '../../../data/repositories/interfaces/IBarcodeRepository';

export type CameraState = {
  isInitialized: boolean;
  initializationError: string | null;
  cameraPermission: CameraPermissionStatus | null;
  isCameraAvailable: boolean;
  isScanning: boolean;
  scannedBarcodes: BarcodeData[];
  currentBarcode: BarcodeData | null;
  showBarcodeDialog: boolean;
  isRequestingPermission: boolean;
  error: string | null;
};

export type CameraAction =
  | { type: 'INITIALIZATION_START' }
  | { type: 'INITIALIZATION_SUCCESS'; payload: { cameraPermission: CameraPermissionStatus; isCameraAvailable: boolean } }
  | { type: 'INITIALIZATION_ERROR'; payload: string }
  | { type: 'REQUEST_PERMISSION_START' }
  | { type: 'REQUEST_PERMISSION_SUCCESS'; payload: CameraPermissionStatus }
  | { type: 'REQUEST_PERMISSION_ERROR'; payload: string }
  | { type: 'START_SCANNING' }
  | { type: 'STOP_SCANNING' }
  | { type: 'BARCODE_DETECTED'; payload: BarcodeData }
  | { type: 'SHOW_BARCODE_DIALOG'; payload: BarcodeData }
  | { type: 'HIDE_BARCODE_DIALOG' }
  | { type: 'CLEAR_HISTORY_SUCCESS' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export class CameraViewModel {
  private cameraUseCase: any;
  private dispatch: (action: CameraAction) => void;
  private scanningUnsubscribe: (() => void) | null = null;

  constructor(
    cameraUseCase: any,
    dispatch: (action: CameraAction) => void
  ) {
    this.cameraUseCase = cameraUseCase;
    this.dispatch = dispatch;
  }

  getInitialState(): CameraState {
    return {
      isInitialized: false,
      initializationError: null,
      cameraPermission: null,
      isCameraAvailable: false,
      isScanning: false,
      scannedBarcodes: [],
      currentBarcode: null,
      showBarcodeDialog: false,
      isRequestingPermission: false,
      error: null,
    };
  }

  reducer(state: CameraState, action: CameraAction): CameraState {
    switch (action.type) {
      case 'INITIALIZATION_START':
        return {
          ...state,
          isInitialized: false,
          initializationError: null,
          error: null
        };
      case 'INITIALIZATION_SUCCESS':
        return {
          ...state,
          isInitialized: true,
          cameraPermission: action.payload.cameraPermission,
          isCameraAvailable: action.payload.isCameraAvailable
        };
      case 'INITIALIZATION_ERROR':
        return {
          ...state,
          isInitialized: false,
          initializationError: action.payload
        };
      case 'REQUEST_PERMISSION_START':
        return {
          ...state,
          isRequestingPermission: true,
          error: null
        };
      case 'REQUEST_PERMISSION_SUCCESS':
        return {
          ...state,
          isRequestingPermission: false,
          cameraPermission: action.payload
        };
      case 'REQUEST_PERMISSION_ERROR':
        return {
          ...state,
          isRequestingPermission: false,
          error: action.payload
        };
      case 'START_SCANNING':
        return {
          ...state,
          isScanning: true,
          error: null
        };
      case 'STOP_SCANNING':
        return {
          ...state,
          isScanning: false
        };
      case 'BARCODE_DETECTED':
        return {
          ...state,
          scannedBarcodes: [action.payload, ...state.scannedBarcodes.slice(0, 9)]
        };
      case 'SHOW_BARCODE_DIALOG':
        return {
          ...state,
          currentBarcode: action.payload,
          showBarcodeDialog: true,
          isScanning: false
        };
      case 'HIDE_BARCODE_DIALOG':
        return {
          ...state,
          currentBarcode: null,
          showBarcodeDialog: false
        };
      case 'CLEAR_HISTORY_SUCCESS':
        return {
          ...state,
          scannedBarcodes: []
        };
      case 'SET_ERROR':
        return {
          ...state,
          error: action.payload
        };
      case 'CLEAR_ERROR':
        return {
          ...state,
          error: null
        };
      default:
        return state;
    }
  }

  async initializeCamera(): Promise<void> {
    this.dispatch({ type: 'INITIALIZATION_START' });
    try {
      const { available, permission } = await this.cameraUseCase.checkCameraAvailabilityAndPermission();
      
      this.dispatch({
        type: 'INITIALIZATION_SUCCESS',
        payload: {
          cameraPermission: permission,
          isCameraAvailable: available
        }
      });

      const history = await this.cameraUseCase.getBarcodeHistory();
      history.forEach(barcode => {
        this.dispatch({ type: 'BARCODE_DETECTED', payload: barcode });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Camera initialization failed';
      this.dispatch({ type: 'INITIALIZATION_ERROR', payload: errorMessage });
    }
  }

  async requestCameraPermission(): Promise<void> {
    this.dispatch({ type: 'REQUEST_PERMISSION_START' });
    try {
      const permission = await this.cameraUseCase.requestCameraPermissionWithFeedback();
      this.dispatch({ type: 'REQUEST_PERMISSION_SUCCESS', payload: permission });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission request failed';
      this.dispatch({ type: 'REQUEST_PERMISSION_ERROR', payload: errorMessage });
    }
  }

  async startScanning(): Promise<void> {
    try {
      this.dispatch({ type: 'START_SCANNING' });
      
      this.scanningUnsubscribe = await this.cameraUseCase.startScanningWithCallback(
        (barcode: BarcodeData) => {
          this.dispatch({ type: 'BARCODE_DETECTED', payload: barcode });
          this.dispatch({ type: 'SHOW_BARCODE_DIALOG', payload: barcode });
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start scanning';
      this.dispatch({ type: 'SET_ERROR', payload: errorMessage });
      this.dispatch({ type: 'STOP_SCANNING' });
    }
  }

  async stopScanning(): Promise<void> {
    try {
      if (this.scanningUnsubscribe) {
        this.scanningUnsubscribe();
        this.scanningUnsubscribe = null;
      }
      await this.cameraUseCase.stopScanning();
      this.dispatch({ type: 'STOP_SCANNING' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop scanning';
      this.dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }

  async clearBarcodeHistory(): Promise<void> {
    try {
      await this.cameraUseCase.clearBarcodeHistory();
      this.dispatch({ type: 'CLEAR_HISTORY_SUCCESS' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear history';
      this.dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }

  hideBarcodeDialog(): void {
    this.dispatch({ type: 'HIDE_BARCODE_DIALOG' });
  }

  clearError(): void {
    this.dispatch({ type: 'CLEAR_ERROR' });
  }

  cleanup(): void {
    if (this.scanningUnsubscribe) {
      this.scanningUnsubscribe();
      this.scanningUnsubscribe = null;
    }
  }
}