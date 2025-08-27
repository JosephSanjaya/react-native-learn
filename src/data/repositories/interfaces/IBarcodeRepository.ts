export interface BarcodeData {
  id: string;
  value: string;
  type: string;
  scannedAt: Date;
}

export interface IBarcodeRepository {
  saveBarcodeResult(value: string, type: string): Promise<BarcodeData>;
  getBarcodeHistory(): Promise<BarcodeData[]>;
  clearBarcodeHistory(): Promise<void>;
  getLastScannedBarcode(): Promise<BarcodeData | null>;
}