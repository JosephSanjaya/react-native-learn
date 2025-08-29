import { IBluetoothService, BluetoothDevice, ReceiptData } from '../services/IBluetoothService.ts';
import { IBluetoothDeviceRepository, BluetoothDeviceData } from '../data/IBluetoothDeviceRepository.ts';

export class BluetoothUseCase {
  constructor(
    private bluetoothService: IBluetoothService,
    private bluetoothDeviceRepository: IBluetoothDeviceRepository
  ) {}

  async scanAndSaveDevices(): Promise<BluetoothDevice[]> {
    const devices = await this.bluetoothService.scanForDevices();
    
    for (const device of devices) {
      const deviceData: BluetoothDeviceData = {
        address: device.address,
        name: device.name,
        isPaired: device.paired || false,
      };
      
      await this.bluetoothDeviceRepository.saveDevice(deviceData);
    }
    
    return devices;
  }

  async connectAndSaveDevice(device: BluetoothDevice): Promise<boolean> {
    const success = await this.bluetoothService.connectToDevice(device.address);
    
    if (success) {
      await this.bluetoothDeviceRepository.updateLastConnected(device.address);
      
      const deviceData: BluetoothDeviceData = {
        address: device.address,
        name: device.name,
        lastConnected: new Date(),
        isPaired: true,
      };
      
      await this.bluetoothDeviceRepository.saveDevice(deviceData);
    }
    
    return success;
  }

  async getSavedDevices(): Promise<BluetoothDeviceData[]> {
    return await this.bluetoothDeviceRepository.getAllDevices();
  }

  async printTestReceipt(): Promise<void> {
    const connectedDevice = this.bluetoothService.getConnectedDevice();
    if (!connectedDevice) {
      throw new Error('No device connected');
    }

    const receiptData = this.generateFormattedReceiptData();
    await this.bluetoothService.printFormattedReceipt(receiptData);
  }

  async printSimpleText(): Promise<void> {
    const connectedDevice = this.bluetoothService.getConnectedDevice();
    if (!connectedDevice) {
      throw new Error('No device connected');
    }

    const testContent = this.generateTestReceipt();
    await this.bluetoothService.printText(testContent);
  }

  async checkConnection(): Promise<boolean> {
    return await this.bluetoothService.isConnected();
  }

  async disconnectDevice(): Promise<void> {
    await this.bluetoothService.disconnect();
  }

  async printQRCodeReceipt(qrContent: string): Promise<void> {
    const connectedDevice = this.bluetoothService.getConnectedDevice();
    if (!connectedDevice) {
      throw new Error('No device connected');
    }

    await this.bluetoothService.printText('<C>QR Code Receipt</C>\n');
    await this.bluetoothService.printText('<C>================================</C>\n');
    await this.bluetoothService.printQRCode(qrContent);
    await this.bluetoothService.printText('<C>================================</C>\n');
    await this.bluetoothService.printText('<C>Scan QR code for more info</C>\n\n\n');
  }

  private generateFormattedReceiptData() {
    const currentDate = new Date().toLocaleString();
    return {
      header: `THERMAL PRINTER TEST\n${currentDate}\nRPP02N Bluetooth Printer`,
      items: [
        { name: 'Test Item 1', price: '$10.00' },
        { name: 'Test Item 2', price: '$15.50' },
        { name: 'Test Item 3', price: '$8.75' }
      ],
      subtotal: '$34.25',
      tax: '$3.43',
      total: '$37.68',
      footer: 'Thank you for your purchase!\nBluetooth connection successful\nPrint test completed.'
    };
  }

  private generateTestReceipt(): string {
    const currentDate = new Date().toLocaleString();
    return `<C>THERMAL PRINTER TEST</C>
<C>================================</C>
Date: ${currentDate}
Printer: RPP02N Thermal Printer
Connection: Bluetooth

Items:
Test Item 1              $10.00
Test Item 2              $15.50
Test Item 3               $8.75
--------------------------------
Subtotal:                $34.25
Tax (10%):                $3.43
--------------------------------
<B>TOTAL:                   $37.68</B>

<C>Thank you for your purchase!</C>

<C>Bluetooth connection successful</C>
<C>Print test completed.</C>
<C>================================</C>

`;
  }
}