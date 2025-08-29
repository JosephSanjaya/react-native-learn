import { Camera } from 'react-native-vision-camera';
import { ICameraService, BarcodeResult, CameraPermissionStatus } from './ICameraService.ts';

export class CameraService implements ICameraService {
  private barcodeCallbacks: ((barcode: BarcodeResult) => void)[] = [];
  private isScanning = false;

  async requestCameraPermission(): Promise<CameraPermissionStatus> {
    try {
      const permission = await Camera.requestCameraPermission();
      
      return {
        granted: permission === 'granted',
        canAskAgain: permission !== 'denied',
        status: permission as 'granted' | 'denied' | 'restricted' | 'not-determined'
      };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async checkCameraPermission(): Promise<CameraPermissionStatus> {
    try {
      const permission = Camera.getCameraPermissionStatus();
      
      return {
        granted: permission === 'granted',
        canAskAgain: permission !== 'denied',
        status: permission as 'granted' | 'denied' | 'restricted' | 'not-determined'
      };
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async startBarcodeScanning(): Promise<void> {
    try {
      this.isScanning = true;
      console.log('Barcode scanning started');
    } catch (error) {
      console.error('Error starting barcode scanning:', error);
      throw new Error(`Failed to start barcode scanning: ${error}`);
    }
  }

  async stopBarcodeScanning(): Promise<void> {
    try {
      this.isScanning = false;
      console.log('Barcode scanning stopped');
    } catch (error) {
      console.error('Error stopping barcode scanning:', error);
      throw new Error(`Failed to stop barcode scanning: ${error}`);
    }
  }

  onBarcodeDetected(callback: (barcode: BarcodeResult) => void): () => void {
    this.barcodeCallbacks.push(callback);
    
    return () => {
      const index = this.barcodeCallbacks.indexOf(callback);
      if (index > -1) {
        this.barcodeCallbacks.splice(index, 1);
      }
    };
  }

  handleBarcodeDetection(barcodes: any[]): void {
    if (barcodes.length > 0 && this.isScanning) {
      const barcode = barcodes[0];
      const result: BarcodeResult = {
        value: barcode.value || barcode.displayValue || '',
        type: barcode.format || 'unknown'
      };

      this.barcodeCallbacks.forEach(callback => {
        try {
          callback(result);
        } catch (error) {
          console.error('Error in barcode callback:', error);
        }
      });
    }
  }

  async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = Camera.getAvailableCameraDevices();
      return devices.length > 0;
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }
}