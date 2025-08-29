export interface BluetoothDevice {
  name: string;
  address: string;
  paired?: boolean;
}

export interface ReceiptData {
  header: string;
  items: Array<{ name: string; price: string }>;
  subtotal: string;
  tax: string;
  total: string;
  footer: string;
}

export interface IBluetoothService {
  isBluetoothEnabled(): Promise<boolean>;
  enableBluetooth(): Promise<boolean>;
  scanForDevices(): Promise<BluetoothDevice[]>;
  connectToDevice(address: string): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  printText(text: string): Promise<void>;
  printImage(imagePath: string): Promise<void>;
  printFormattedReceipt(receiptData: ReceiptData): Promise<void>;
  printQRCode(content: string, size?: number): Promise<void>;
  printBarcode(content: string): Promise<void>;
  getConnectedDevice(): BluetoothDevice | null;
}