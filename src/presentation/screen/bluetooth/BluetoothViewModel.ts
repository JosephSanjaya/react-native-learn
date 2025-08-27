import { Alert } from 'react-native';

export type BluetoothDevice = {
  name: string;
  address: string;
  paired?: boolean;
};

export type BluetoothState = {
  isInitialized: boolean;
  initializationError: string | null;
  bluetoothEnabled: boolean;
  bluetoothStatusColor: string;
  discoveredDevices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  isScanning: boolean;
  isConnecting: boolean;
  connectingDeviceAddress: string | null;
  isPrinting: boolean;
  error: string | null;
};

export type BluetoothAction =
  | { type: 'INITIALIZATION_START' }
  | { type: 'INITIALIZATION_SUCCESS'; payload: { bluetoothEnabled: boolean } }
  | { type: 'INITIALIZATION_ERROR'; payload: string }
  | { type: 'SET_BLUETOOTH_STATUS'; payload: boolean }
  | { type: 'SCAN_START' }
  | { type: 'SCAN_SUCCESS'; payload: BluetoothDevice[] }
  | { type: 'SCAN_ERROR'; payload: string }
  | { type: 'CONNECT_START'; payload: string }
  | { type: 'CONNECT_SUCCESS'; payload: BluetoothDevice }
  | { type: 'CONNECT_ERROR'; payload: string }
  | { type: 'DISCONNECT_SUCCESS' }
  | { type: 'PRINT_START' }
  | { type: 'PRINT_SUCCESS' }
  | { type: 'PRINT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export class BluetoothViewModel {
  private bluetoothService: any;
  private bluetoothUseCase: any;
  private dispatch: (action: BluetoothAction) => void;

  constructor(
    bluetoothService: any,
    bluetoothUseCase: any,
    dispatch: (action: BluetoothAction) => void
  ) {
    this.bluetoothService = bluetoothService;
    this.bluetoothUseCase = bluetoothUseCase;
    this.dispatch = dispatch;
  }

  getInitialState(): BluetoothState {
    return {
      isInitialized: false,
      initializationError: null,
      bluetoothEnabled: false,
      bluetoothStatusColor: '#F44336',
      discoveredDevices: [],
      connectedDevice: null,
      isScanning: false,
      isConnecting: false,
      connectingDeviceAddress: null,
      isPrinting: false,
      error: null,
    };
  }  reducer
(state: BluetoothState, action: BluetoothAction): BluetoothState {
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
          bluetoothEnabled: action.payload.bluetoothEnabled,
          bluetoothStatusColor: action.payload.bluetoothEnabled ? '#4CAF50' : '#F44336'
        };
      case 'INITIALIZATION_ERROR':
        return { 
          ...state, 
          isInitialized: false, 
          initializationError: action.payload 
        };
      case 'SET_BLUETOOTH_STATUS':
        return { 
          ...state, 
          bluetoothEnabled: action.payload,
          bluetoothStatusColor: action.payload ? '#4CAF50' : '#F44336'
        };
      case 'SCAN_START':
        return { 
          ...state, 
          isScanning: true, 
          error: null,
          discoveredDevices: []
        };
      case 'SCAN_SUCCESS':
        return { 
          ...state, 
          isScanning: false, 
          discoveredDevices: action.payload 
        };
      case 'SCAN_ERROR':
        return { 
          ...state, 
          isScanning: false, 
          error: action.payload 
        };
      case 'CONNECT_START':
        return { 
          ...state, 
          isConnecting: true, 
          connectingDeviceAddress: action.payload,
          error: null 
        };
      case 'CONNECT_SUCCESS':
        return { 
          ...state, 
          isConnecting: false, 
          connectingDeviceAddress: null,
          connectedDevice: action.payload 
        };
      case 'CONNECT_ERROR':
        return { 
          ...state, 
          isConnecting: false, 
          connectingDeviceAddress: null,
          error: action.payload 
        };
      case 'DISCONNECT_SUCCESS':
        return { 
          ...state, 
          connectedDevice: null 
        };
      case 'PRINT_START':
        return { 
          ...state, 
          isPrinting: true, 
          error: null 
        };
      case 'PRINT_SUCCESS':
        return { 
          ...state, 
          isPrinting: false 
        };
      case 'PRINT_ERROR':
        return { 
          ...state, 
          isPrinting: false, 
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

  async initializeBluetooth(): Promise<void> {
    this.dispatch({ type: 'INITIALIZATION_START' });
    try {
      const isEnabled = await this.bluetoothService.isBluetoothEnabled();
      this.dispatch({ 
        type: 'INITIALIZATION_SUCCESS', 
        payload: { bluetoothEnabled: isEnabled } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bluetooth initialization failed';
      this.dispatch({ type: 'INITIALIZATION_ERROR', payload: errorMessage });
    }
  }

  async startScan(): Promise<void> {
    this.dispatch({ type: 'SCAN_START' });
    try {
      const devices = await this.bluetoothUseCase.scanAndSaveDevices();
      this.dispatch({ type: 'SCAN_SUCCESS', payload: devices });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Scan failed';
      console.error('Bluetooth scan failed:', error);
      this.dispatch({ type: 'SCAN_ERROR', payload: errorMessage });
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<void> {
    this.dispatch({ type: 'CONNECT_START', payload: device.address });
    try {
      const success = await this.bluetoothUseCase.connectAndSaveDevice(device);
      if (success) {
        this.dispatch({ type: 'CONNECT_SUCCESS', payload: device });
        Alert.alert('Success', `Connected to ${device.name || device.address}`);
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      console.error('Bluetooth connection failed:', error);
      this.dispatch({ type: 'CONNECT_ERROR', payload: errorMessage });
      Alert.alert('Connection Failed', errorMessage);
    }
  }

  async disconnectDevice(): Promise<void> {
    try {
      await this.bluetoothService.disconnect();
      this.dispatch({ type: 'DISCONNECT_SUCCESS' });
    } catch (error) {
      console.error('Bluetooth disconnect failed:', error);
    }
  }

  async printTest(): Promise<void> {
    this.dispatch({ type: 'PRINT_START' });
    try {
      await this.bluetoothUseCase.printTestReceipt();
      this.dispatch({ type: 'PRINT_SUCCESS' });
      Alert.alert('Success', 'Test print completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Print failed';
      console.error('Print failed:', error);
      this.dispatch({ type: 'PRINT_ERROR', payload: errorMessage });
      Alert.alert('Print Failed', errorMessage);
    }
  }

  private generateTestPrintContent(): string {
    const currentDate = new Date().toLocaleString();
    return `
================================
        TEST PRINT
================================
Date: ${currentDate}
Device: RPP02N Thermal Printer
Status: Connected

This is a test print to verify
the bluetooth connection and
printer functionality.

Thank you for testing!
================================


`;
  }

  clearError(): void {
    this.dispatch({ type: 'CLEAR_ERROR' });
  }
}