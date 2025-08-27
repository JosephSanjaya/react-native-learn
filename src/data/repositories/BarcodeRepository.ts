import AsyncStorage from '@react-native-async-storage/async-storage';
import { IBarcodeRepository, BarcodeData } from './interfaces/IBarcodeRepository';

export class BarcodeRepository implements IBarcodeRepository {
  private readonly BARCODE_HISTORY_KEY = '@barcode_history';
  private readonly MAX_HISTORY_SIZE = 50;

  async saveBarcodeResult(value: string, type: string): Promise<BarcodeData> {
    try {
      const barcodeData: BarcodeData = {
        id: Date.now().toString(),
        value,
        type,
        scannedAt: new Date()
      };

      const history = await this.getBarcodeHistory();
      const updatedHistory = [barcodeData, ...history.slice(0, this.MAX_HISTORY_SIZE - 1)];
      
      await AsyncStorage.setItem(this.BARCODE_HISTORY_KEY, JSON.stringify(updatedHistory));
      
      return barcodeData;
    } catch (error) {
      console.error('Error saving barcode result:', error);
      throw new Error(`Failed to save barcode result: ${error}`);
    }
  }

  async getBarcodeHistory(): Promise<BarcodeData[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.BARCODE_HISTORY_KEY);
      
      if (!historyJson) {
        return [];
      }

      const history = JSON.parse(historyJson);
      return history.map((item: any) => ({
        ...item,
        scannedAt: new Date(item.scannedAt)
      }));
    } catch (error) {
      console.error('Error getting barcode history:', error);
      return [];
    }
  }

  async clearBarcodeHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.BARCODE_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing barcode history:', error);
      throw new Error(`Failed to clear barcode history: ${error}`);
    }
  }

  async getLastScannedBarcode(): Promise<BarcodeData | null> {
    try {
      const history = await this.getBarcodeHistory();
      return history.length > 0 ? history[0] : null;
    } catch (error) {
      console.error('Error getting last scanned barcode:', error);
      return null;
    }
  }
}