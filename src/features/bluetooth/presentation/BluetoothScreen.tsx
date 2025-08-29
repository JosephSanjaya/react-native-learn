import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBluetoothViewModel } from './useBluetoothViewModel.ts';

interface BluetoothScreenProps {
  onNavigateBack?: () => void;
}

export const BluetoothScreen = ({ onNavigateBack }: BluetoothScreenProps) => {
  const { state, actions } = useBluetoothViewModel();

  if (!state.isInitialized && !state.initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing Bluetooth...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bluetooth initialization failed: {state.initializationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onNavigateBack && (
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Bluetooth Printer</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.bluetoothSection}>
        <Text style={styles.sectionTitle}>Bluetooth Status</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: state.bluetoothStatusColor }]}>
            <Text style={styles.statusText}>
              {state.bluetoothEnabled ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, state.isScanning && styles.disabledButton]} 
            onPress={actions.startScan}
            disabled={state.isScanning || !state.bluetoothEnabled}
          >
            <Text style={styles.buttonText}>
              {state.isScanning ? 'Scanning...' : 'Scan Devices'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, (!state.connectedDevice || state.isPrinting) && styles.disabledButton]} 
            onPress={actions.printTest}
            disabled={!state.connectedDevice || state.isPrinting}
          >
            <Text style={styles.buttonText}>
              {state.isPrinting ? 'Printing...' : 'Print Test'}
            </Text>
          </TouchableOpacity>
        </View>

        {state.connectedDevice && (
          <View style={styles.connectedDeviceContainer}>
            <Text style={styles.connectedDeviceTitle}>Connected Device:</Text>
            <Text style={styles.connectedDeviceName}>{state.connectedDevice.name}</Text>
            <Text style={styles.connectedDeviceAddress}>{state.connectedDevice.address}</Text>
          </View>
        )}

        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{state.error}</Text>
            <TouchableOpacity onPress={actions.clearError} style={styles.errorCloseButton}>
              <Text style={styles.errorCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.devicesContainer}>
        <Text style={styles.sectionTitle}>Available Devices</Text>
        <FlatList
          data={state.discoveredDevices}
          keyExtractor={(device) => device.address}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.deviceItem,
                state.connectedDevice?.address === item.address && styles.connectedDeviceItem
              ]}
              onPress={() => actions.connectToDevice(item)}
              disabled={state.isConnecting}
            >
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceAddress}>{item.address}</Text>
              </View>
              <View style={styles.deviceStatus}>
                {state.connectedDevice?.address === item.address ? (
                  <Text style={styles.connectedText}>Connected</Text>
                ) : (
                  <Text style={styles.disconnectedText}>
                    {state.isConnecting && state.connectingDeviceAddress === item.address ? 'Connecting...' : 'Tap to Connect'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {state.isScanning ? 'Scanning for devices...' : 'No devices found. Tap "Scan Devices" to start.'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#757575',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bluetoothSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  connectedDeviceContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  connectedDeviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  connectedDeviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  connectedDeviceAddress: {
    fontSize: 12,
    color: '#388E3C',
  },
  devicesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  connectedDeviceItem: {
    backgroundColor: '#f0f8f0',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  connectedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disconnectedText: {
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
  },
  errorCloseButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorCloseText: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
});