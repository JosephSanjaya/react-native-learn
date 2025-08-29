import { NativeModules } from 'react-native';
import { IBluetoothService, BluetoothDevice, ReceiptData } from './IBluetoothService.ts';
import { IBluetoothDeviceRepository } from '../data/IBluetoothDeviceRepository.ts';

const { ThermalPrinterModule } = NativeModules;

export class BluetoothService implements IBluetoothService {
    private connectedDevice: BluetoothDevice | null = null;
    private bluetoothDeviceRepository?: IBluetoothDeviceRepository;

    constructor(bluetoothDeviceRepository?: IBluetoothDeviceRepository) {
        this.bluetoothDeviceRepository = bluetoothDeviceRepository;
    }

    async isBluetoothEnabled(): Promise<boolean> {
        try {
            const devices = await ThermalPrinterModule.getBluetoothDeviceList();
            return Array.isArray(devices);
        } catch (error) {
            console.error('Error checking Bluetooth status:', error);
            return false;
        }
    }

    async enableBluetooth(): Promise<boolean> {
        // No direct way to enable — just check
        return this.isBluetoothEnabled();
    }

    async scanForDevices(): Promise<BluetoothDevice[]> {
        try {
            const isEnabled = await this.isBluetoothEnabled();
            if (!isEnabled) {
                throw new Error('Bluetooth is not enabled. Please enable Bluetooth in settings.');
            }

            const devices = await ThermalPrinterModule.getBluetoothDeviceList();

            return devices.map((device: any) => ({
                name: device.device_name || 'Unknown Device',
                address: device.inner_mac_address || device.device_id,
                paired: true,
            }));
        } catch (error) {
            console.error('Error scanning for devices:', error);
            throw error;
        }
    }

    async connectToDevice(address: string): Promise<boolean> {
        try {
            // In this lib, there’s no “open connection” API —
            // you just call printBluetooth when printing.
            // So we treat "connect" as verifying the device exists.
            const devices = await this.scanForDevices();
            const device = devices.find(d => d.address === address);

            if (device) {
                this.connectedDevice = device;
                if (this.bluetoothDeviceRepository) {
                    await this.bluetoothDeviceRepository.updateLastConnected(address);
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error connecting to device:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        // No explicit disconnect in ThermalPrinterModule — just clear state
        this.connectedDevice = null;
    }

    async printText(text: string): Promise<void> {
        try {
            if (!this.connectedDevice) throw new Error('No device connected');

            await ThermalPrinterModule.printBluetooth(
                this.connectedDevice.address,
                text + '\n\n\n',
                true, // autoCut
                false, // openCashbox
                20, // mmFeedPaper
                203, // printerDpi
                80, // printerWidthMM
                42 // chars per line
            );
        } catch (error) {
            console.error('Error printing text:', error);
            throw new Error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async printImage(imagePath: string): Promise<void> {
        try {
            if (!this.connectedDevice) throw new Error('No device connected');

            // This lib doesn’t expose printPic, so you’d need to convert image → text/ESC commands
            // Placeholder for now
            throw new Error('printImage is not supported in ThermalPrinterModule');
        } catch (error) {
            console.error('Error printing image:', error);
            throw error;
        }
    }

    async printFormattedReceipt(receiptData: ReceiptData): Promise<void> {
        try {
            if (!this.connectedDevice) throw new Error('No device connected');

            let buffer = '';
            buffer += `<C>${receiptData.header}</C>\n`;
            buffer += '<C>================================</C>\n';

            for (const item of receiptData.items) {
                buffer += `${item.name.padEnd(20)} ${item.price.padStart(8)}\n`;
            }

            buffer += '--------------------------------\n';
            buffer += `Subtotal: ${receiptData.subtotal.padStart(20)}\n`;
            buffer += `Tax: ${receiptData.tax.padStart(25)}\n`;
            buffer += '--------------------------------\n';
            buffer += `<B>TOTAL: ${receiptData.total.padStart(22)}</B>\n`;
            buffer += `\n<C>${receiptData.footer}</C>\n\n\n`;

            await ThermalPrinterModule.printBluetooth(
                this.connectedDevice.address,
                buffer,
                true,
                false,
                20,
                203,
                80,
                42
            );
        } catch (error) {
            console.error('Error printing formatted receipt:', error);
            throw new Error(`Formatted print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async isConnected(): Promise<boolean> {
        return this.connectedDevice !== null;
    }

    async printQRCode(content: string, size: number = 200): Promise<void> {
        try {
            if (!this.connectedDevice) throw new Error('No device connected');

            // Module doesn’t have native QR — send as text or ESC sequence
            const qrText = `<C>QR Code: ${content}</C>\n`;

            await ThermalPrinterModule.printBluetooth(
                this.connectedDevice.address,
                qrText,
                true,
                false,
                20,
                203,
                80,
                42
            );
        } catch (error) {
            console.error('Error printing QR code:', error);
            throw new Error(`QR code print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async printBarcode(content: string): Promise<void> {
        try {
            if (!this.connectedDevice) throw new Error('No device connected');

            const barcodeText = `<C>Barcode: ${content}</C>\n`;

            await ThermalPrinterModule.printBluetooth(
                this.connectedDevice.address,
                barcodeText,
                true,
                false,
                20,
                203,
                80,
                42
            );
        } catch (error) {
            console.error('Error printing barcode:', error);
            throw new Error(`Barcode print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    getConnectedDevice(): BluetoothDevice | null {
        return this.connectedDevice;
    }
}
