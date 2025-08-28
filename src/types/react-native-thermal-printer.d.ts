// react-native-thermal-printer.d.ts
import { NativeModules } from "react-native";

type BluetoothPrinter = {
    deviceName: string;
    macAddress: string;
};

interface ThermalPrinterModuleType {
    printTcp(
        ip: string,
        port: number,
        payload: string,
        autoCut: boolean,
        openCashbox: boolean,
        mmFeedPaper: number,
        printerDpi: number,
        printerWidthMM: number,
        printerNbrCharactersPerLine: number,
        timeout: number
    ): Promise<void>;

    printBluetooth(
        macAddress: string,
        payload: string,
        autoCut: boolean,
        openCashbox: boolean,
        mmFeedPaper: number,
        printerDpi: number,
        printerWidthMM: number,
        printerNbrCharactersPerLine: number
    ): Promise<void>;

    getBluetoothDeviceList(): Promise<BluetoothPrinter[]>;
}

declare module "react-native" {
    interface NativeModulesStatic {
        ThermalPrinterModule: ThermalPrinterModuleType;
    }
}
