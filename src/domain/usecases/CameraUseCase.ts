import { ICameraService, BarcodeResult, CameraPermissionStatus } from '../../services/interfaces/ICameraService';
import { IBarcodeRepository, BarcodeData } from '../../data/repositories/interfaces/IBarcodeRepository';

export class CameraUseCase {
  constructor(
    private cameraService: ICameraService,
    private barcodeRepository: IBarcodeRepository
  ) {}

  async requestCameraPermissionWithFeedback(): Promise<CameraPermissionStatus> {
    try {
      const permissionStatus = await this.cameraService.requestCameraPermission();
      
      if (!permissionStatus.granted) {
        console.warn('Camera permission not granted:', permissionStatus.status);
      }
      
      return permissionStatus;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      throw new Error(`Failed to request camera permission: ${error}`);
    }
  }

  async checkCameraAvailabilityAndPermission(): Promise<{
    available: boolean;
    permission: CameraPermissionStatus;
  }> {
    try {
      const [available, permission] = await Promise.all([
        this.cameraService.isCameraAvailable(),
        this.cameraService.checkCameraPermission()
      ]);

      return { available, permission };
    } catch (error) {
      console.error('Error checking camera availability and permission:', error);
      throw new Error(`Failed to check camera status: ${error}`);
    }
  }

  async startScanningWithCallback(
    onBarcodeDetected: (barcode: BarcodeData) => void
  ): Promise<() => void> {
    try {
      await this.cameraService.startBarcodeScanning();
      
      const unsubscribe = this.cameraService.onBarcodeDetected(async (barcode: BarcodeResult) => {
        try {
          const savedBarcode = await this.barcodeRepository.saveBarcodeResult(
            barcode.value,
            barcode.type
          );
          onBarcodeDetected(savedBarcode);
        } catch (error) {
          console.error('Error saving barcode result:', error);
        }
      });

      return () => {
        unsubscribe();
        this.cameraService.stopBarcodeScanning();
      };
    } catch (error) {
      console.error('Error starting scanning:', error);
      throw new Error(`Failed to start scanning: ${error}`);
    }
  }

  async stopScanning(): Promise<void> {
    try {
      await this.cameraService.stopBarcodeScanning();
    } catch (error) {
      console.error('Error stopping scanning:', error);
      throw new Error(`Failed to stop scanning: ${error}`);
    }
  }

  async getBarcodeHistory(): Promise<BarcodeData[]> {
    try {
      return await this.barcodeRepository.getBarcodeHistory();
    } catch (error) {
      console.error('Error getting barcode history:', error);
      return [];
    }
  }

  async clearBarcodeHistory(): Promise<void> {
    try {
      await this.barcodeRepository.clearBarcodeHistory();
    } catch (error) {
      console.error('Error clearing barcode history:', error);
      throw new Error(`Failed to clear barcode history: ${error}`);
    }
  }
}