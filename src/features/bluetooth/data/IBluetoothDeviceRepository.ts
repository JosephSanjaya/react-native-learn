export interface BluetoothDeviceData {
  address: string;
  name: string;
  lastConnected?: Date;
  isPaired: boolean;
}

export interface IBluetoothDeviceRepository {
  saveDevice(device: BluetoothDeviceData): Promise<void>;
  getDevice(address: string): Promise<BluetoothDeviceData | null>;
  getAllDevices(): Promise<BluetoothDeviceData[]>;
  removeDevice(address: string): Promise<void>;
  updateLastConnected(address: string): Promise<void>;
}