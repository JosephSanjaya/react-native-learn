declare module 'react-native-thermal-printer' {
  export interface PrinterDevice {
    device_name?: string;
    inner_mac_address?: string;
    device_id?: string;
  }

  export interface PrinterOptions {
    beep?: boolean;
    cut?: boolean;
    tailingLine?: boolean;
    encoding?: string;
  }

  export interface ImageOptions {
    imageWidth?: number;
    imageHeight?: number;
  }

  export interface ConnectPayload {
    inner_mac_address: string;
  }

  export interface IUSBPrinter {
    deviceList(): Promise<PrinterDevice[]>;
    connectPrinter(payload: any): Promise<void>;
    closeConn(): Promise<void>;
    printText(text: string, options?: PrinterOptions): Promise<void>;
    printPic(imagePath: string, options?: ImageOptions): Promise<void>;
  }

  export interface INetPrinter {
    deviceList(): Promise<PrinterDevice[]>;
    connectPrinter(payload: any): Promise<void>;
    closeConn(): Promise<void>;
    printText(text: string, options?: PrinterOptions): Promise<void>;
    printPic(imagePath: string, options?: ImageOptions): Promise<void>;
  }

  export interface IBLEPrinter {
    connectPrinter(payload: ConnectPayload): Promise<void>;
    closeConn(): Promise<void>;
    printText(text: string, options?: PrinterOptions): Promise<void>;
    printPic(imagePath: string, options?: ImageOptions): Promise<void>;
  }

  export class USBPrinter implements IUSBPrinter {
    static deviceList(): Promise<PrinterDevice[]>;
    connectPrinter(payload: any): Promise<void>;
    closeConn(): Promise<void>;
    printText(text: string, options?: PrinterOptions): Promise<void>;
    printPic(imagePath: string, options?: ImageOptions): Promise<void>;
  }

  export class NetPrinter implements INetPrinter {
    static deviceList(): Promise<PrinterDevice[]>;
    connectPrinter(payload: any): Promise<void>;
    closeConn(): Promise<void>;
    printText(text: string, options?: PrinterOptions): Promise<void>;
    printPic(imagePath: string, options?: ImageOptions): Promise<void>;
  }

  export class BLEPrinter implements IBLEPrinter {
    static deviceList(): Promise<PrinterDevice[]>;
    connectPrinter(payload: ConnectPayload): Promise<void>;
    closeConn(): Promise<void>;
    printText(text: string, options?: PrinterOptions): Promise<void>;
    printPic(imagePath: string, options?: ImageOptions): Promise<void>;
  }
}