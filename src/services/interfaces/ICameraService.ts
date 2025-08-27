export interface BarcodeResult {
  value: string;
  type: string;
}

export interface CameraPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'restricted' | 'not-determined';
}

export interface ICameraService {
  requestCameraPermission(): Promise<CameraPermissionStatus>;
  checkCameraPermission(): Promise<CameraPermissionStatus>;
  startBarcodeScanning(): Promise<void>;
  stopBarcodeScanning(): Promise<void>;
  onBarcodeDetected(callback: (barcode: BarcodeResult) => void): () => void;
  isCameraAvailable(): Promise<boolean>;
}