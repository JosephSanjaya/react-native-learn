import AsyncStorage from '@react-native-async-storage/async-storage';
import { IBluetoothDeviceRepository, BluetoothDeviceData } from './interfaces/IBluetoothDeviceRepository';

export class BluetoothDeviceRepository implements IBluetoothDeviceRepository {
  private readonly BLUETOOTH_DEVICES_KEY = '@bluetooth_devices';

  async saveDevice(device: BluetoothDeviceData): Promise<void> {
    try {
      const devices = await this.getAllDevices();
      const existingIndex = devices.findIndex(d => d.address === device.address);
      
      if (existingIndex >= 0) {
        devices[existingIndex] = device;
      } else {
        devices.push(device);
      }
      
      await AsyncStorage.setItem(this.BLUETOOTH_DEVICES_KEY, JSON.stringify(devices));
    } catch (error) {
      throw new Error(`Failed to save Bluetooth device: ${error}`);
    }
  }

  async getDevice(address: string): Promise<BluetoothDeviceData | null> {
    try {
      const devices = await this.getAllDevices();
      return devices.find(d => d.address === address) || null;
    } catch (error) {
      throw new Error(`Failed to get Bluetooth device: ${error}`);
    }
  }

  async getAllDevices(): Promise<BluetoothDeviceData[]> {
    try {
      const devicesJson = await AsyncStorage.getItem(this.BLUETOOTH_DEVICES_KEY);
      if (!devicesJson) {
        return [];
      }
      
      const devices = JSON.parse(devicesJson);
      return devices.map((device: any) => ({
        ...device,
        lastConnected: device.lastConnected ? new Date(device.lastConnected) : undefined
      }));
    } catch (error) {
      console.error('Failed to get Bluetooth devices:', error);
      return [];
    }
  }

  async removeDevice(address: string): Promise<void> {
    try {
      const devices = await this.getAllDevices();
      const filteredDevices = devices.filter(d => d.address !== address);
      await AsyncStorage.setItem(this.BLUETOOTH_DEVICES_KEY, JSON.stringify(filteredDevices));
    } catch (error) {
      throw new Error(`Failed to remove Bluetooth device: ${error}`);
    }
  }

  async updateLastConnected(address: string): Promise<void> {
    try {
      const device = await this.getDevice(address);
      if (device) {
        device.lastConnected = new Date();
        await this.saveDevice(device);
      }
    } catch (error) {
      throw new Error(`Failed to update last connected: ${error}`);
    }
  }
}