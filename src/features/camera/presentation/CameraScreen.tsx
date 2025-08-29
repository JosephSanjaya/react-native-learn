import React, {useRef, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
    Alert,
    Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera, useCameraDevice, useCameraDevices, useCodeScanner} from 'react-native-vision-camera';
import {useCameraViewModel} from './useCameraViewModel.ts';

interface CameraScreenProps {
    onNavigateBack?: () => void;
}

const {width, height} = Dimensions.get('window');

export const CameraScreen = ({onNavigateBack}: CameraScreenProps) => {
    const {state, actions} = useCameraViewModel();
    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'code-93', 'codabar', 'upc-a', 'upc-e'],
        onCodeScanned: (codes) => {
            if (codes.length > 0 && state.isScanning) {
                const code = codes[0];
                // Simulate barcode detection through the service
                const mockBarcode = {
                    id: Date.now().toString(),
                    value: code.value || '',
                    type: code.type || 'unknown',
                    scannedAt: new Date()
                };
                actions.hideBarcodeDialog();
                setTimeout(() => {
                    Alert.alert(
                        'Barcode Detected',
                        `Value: ${mockBarcode.value}\nType: ${mockBarcode.type}`,
                        [{text: 'OK', onPress: () => actions.stopScanning()}]
                    );
                }, 100);
            }
        },
    });

    if (!state.isInitialized && !state.initializationError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Initializing camera...</Text>
                </View>
            </SafeAreaView>
        );
    }
    if (state.initializationError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Barcode Scanner</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Camera initialization failed: {state.initializationError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={actions.initializeCamera}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!state.cameraPermission?.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Barcode Scanner</Text>
                </View>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>
                        This app needs camera access to scan barcodes. Please grant camera permission to continue.
                    </Text>
                    <TouchableOpacity
                        style={[styles.permissionButton, state.isRequestingPermission && styles.disabledButton]}
                        onPress={actions.requestCameraPermission}
                        disabled={state.isRequestingPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            {state.isRequestingPermission ? 'Requesting...' : 'Grant Permission'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!state.isCameraAvailable || !device) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Barcode Scanner</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Camera not available on this device</Text>
                </View>
            </SafeAreaView>
        );
    }
    return (

        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Barcode Scanner</Text>
            </View>

            <View style={styles.cameraContainer}>
                <Camera
                    ref={cameraRef}
                    style={styles.camera}
                    device={device}
                    isActive={state.isScanning}
                    codeScanner={state.isScanning ? codeScanner : undefined}
                />

                <View style={styles.overlay}>
                    <View style={styles.scanArea}/>
                    <Text style={styles.scanInstruction}>
                        {state.isScanning ? 'Point camera at barcode' : 'Tap scan to start'}
                    </Text>
                </View>
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={[
                        styles.scanButton,
                        state.isScanning ? styles.stopButton : styles.startButton
                    ]}
                    onPress={state.isScanning ? actions.stopScanning : actions.startScanning}
                >
                    <Text style={styles.scanButtonText}>
                        {state.isScanning ? 'Stop Scanning' : 'Start Scanning'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>Scan History</Text>
                    {state.scannedBarcodes.length > 0 && (
                        <TouchableOpacity onPress={actions.clearBarcodeHistory} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={state.scannedBarcodes}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <View style={styles.historyItem}>
                            <Text style={styles.barcodeValue}>{item.value}</Text>
                            <Text style={styles.barcodeType}>{item.type}</Text>
                            <Text style={styles.barcodeDate}>
                                {item.scannedAt.toLocaleString()}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No barcodes scanned yet</Text>
                    }
                />
            </View>
            {state.error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{state.error}</Text>
                    <TouchableOpacity onPress={actions.clearError} style={styles.errorCloseButton}>
                        <Text style={styles.errorCloseText}>×</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={state.showBarcodeDialog}
                transparent={true}
                animationType="fade"
                onRequestClose={actions.hideBarcodeDialog}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Barcode Detected</Text>
                        {state.currentBarcode && (
                            <>
                                <Text style={styles.modalValue}>Value: {state.currentBarcode.value}</Text>
                                <Text style={styles.modalType}>Type: {state.currentBarcode.type}</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={actions.hideBarcodeDialog}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#2196F3',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cameraContainer: {
        flex: 2,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#4CAF50',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    scanInstruction: {
        color: 'white',
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    controlsContainer: {
        backgroundColor: '#fff',
        padding: 16,
    },
    scanButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    stopButton: {
        backgroundColor: '#F44336',
    },
    scanButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    historyContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    historyItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    barcodeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    barcodeType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    barcodeDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        paddingVertical: 20,
    },
    disabledButton: {
        backgroundColor: '#9E9E9E',
    },
    errorBanner: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
        borderWidth: 1,
        borderRadius: 6,
        padding: 12,
        margin: 16,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        margin: 20,
        minWidth: 280,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalValue: {
        fontSize: 16,
        marginBottom: 8,
    },
    modalType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});