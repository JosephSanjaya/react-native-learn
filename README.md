# WorkManager alternative dengan React Native

Project ini memberikan penjelasan rinci tentang proyek yang telah kita bangun, dengan fokus pada cara mengimplementasikan tugas latar belakang di aplikasi React Native menggunakan `react-native-background-fetch` dan `WatermelonDB`.

## 1. Ikhtisar Proyek

Tujuan dari proyek ini adalah untuk menunjukkan cara melakukan sinkronisasi data latar belakang di aplikasi React Native. Kami telah membuat aplikasi sederhana yang menyimulasikan proses sinkronisasi batch, di mana data diambil dari basis data lokal dan ditampilkan di UI. Tugas latar belakang dijadwalkan untuk berjalan secara berkala, bahkan saat aplikasi berada di latar belakang atau dihentikan.

### Teknologi yang Digunakan

*   **React Native:** Kerangka kerja untuk membangun aplikasi asli menggunakan React.
*   **`react-native-background-fetch`:** Pustaka untuk menjadwalkan tugas latar belakang di Android dan iOS.
*   **`WatermelonDB`:** Kerangka kerja basis data reaktif berkinerja tinggi untuk React Native.
*   **`@react-native-firebase/messaging`:** Firebase Cloud Messaging untuk push notifications dan broadcast messaging.
*   **`react-native-push-notification`:** Pustaka untuk menangani notifikasi lokal dengan pencegahan duplikasi.
*   **`@react-native-async-storage/async-storage`:** Penyimpanan lokal untuk FCM token dan data aplikasi.
*   **`react-native-thermal-printer`:** Pustaka untuk koneksi dan printing ke thermal printer via Bluetooth.
*   **`react-native-vision-camera`:** Pustaka untuk akses kamera dan barcode scanning dengan performa tinggi.
*   **TypeScript:** Superset JavaScript yang diketik.
*   **React Context API:** Untuk dependency injection dan state management.
*   **Repository Pattern:** Untuk abstraksi layer data dan pemisahan concerns.

> Notes untuk `react-native-vision-camera`, library tidak bisa berjalan out of the box perlu merubah sedikit pada `node_modules`
> `com.mrousavy.camera.react.CameraViewManager` perlu mengganti output type `getExportedCustomDirectEventTypeConstants` menjadi `Map<String, Any>`   
> `com.mrousavy.camera.react.CameraViewModule` perlu mengganti `currentActivity` menjadi `reactApplicationContext.currentActivity`

## 2. Struktur Proyek

Struktur proyek telah direfactor menggunakan feature-first architecture dengan clean architecture, dependency injection, dan service orchestration:

```
.
├── android
├── ios
├── src
│   ├── core (Shared Core Services & Infrastructure)
│   │   ├── data
│   │   │   ├── db
│   │   │   │   ├── index.ts
│   │   │   │   ├── Post.ts
│   │   │   │   └── schema.ts
│   │   │   └── repositories
│   │   │       ├── interfaces
│   │   │       │   ├── IPostRepository.ts
│   │   │       │   └── IFCMTokenRepository.ts
│   │   │       ├── PostRepository.ts
│   │   │       └── FCMTokenRepository.ts
│   │   ├── di (Dependency Injection)
│   │   │   ├── context
│   │   │   │   └── ServiceContext.tsx
│   │   │   └── hooks
│   │   │       ├── useBackgroundSync.ts
│   │   │       ├── usePostRepository.ts
│   │   │       ├── usePermission.ts
│   │   │       ├── useNotification.ts
│   │   │       ├── useFCM.ts
│   │   │       ├── useFCMToken.ts
│   │   │       ├── useAppInitialization.ts
│   │   │       ├── useConsoleLogger.ts
│   │   │       └── useAppViewModel.ts (deprecated - redirects to HomeViewModel)
│   │   └── services
│   │       ├── AppInitializer.ts
│   │       ├── FirebaseInitializer.ts
│   │       ├── FCMMessageHandler.ts
│   │       ├── NotificationManager.ts
│   │       ├── BackgroundSync.ts
│   │       ├── PermissionService.ts
│   │       ├── NotificationService.ts
│   │       ├── FCMService.ts
│   │       ├── IBackgroundSyncService.ts
│   │       ├── IPermissionService.ts
│   │       ├── INotificationService.ts
│   │       └── IFCMService.ts
│   └── features (Feature-First Organization)
│       ├── home
│       │   └── presentation
│       │       ├── HomeScreen.tsx
│       │       ├── HomeViewModel.ts
│       │       └── useHomeViewModel.ts
│       ├── bluetooth
│       │   ├── data
│       │   │   ├── BluetoothDeviceRepository.ts
│       │   │   └── IBluetoothDeviceRepository.ts
│       │   ├── di
│       │   │   └── useBluetoothService.ts
│       │   ├── domain
│       │   │   └── BluetoothUseCase.ts
│       │   ├── presentation
│       │   │   ├── BluetoothScreen.tsx
│       │   │   ├── BluetoothViewModel.ts
│       │   │   └── useBluetoothViewModel.ts
│       │   ├── services
│       │   │   ├── BluetoothService.ts
│       │   │   └── IBluetoothService.ts
│       │   └── util
│       │       └── types
│       │           └── react-native-thermal-printer.d.ts
│       └── camera
│           ├── data
│           │   ├── BarcodeRepository.ts
│           │   └── IBarcodeRepository.ts
│           ├── di
│           │   └── useCameraUseCase.ts
│           ├── domain
│           │   └── CameraUseCase.ts
│           ├── presentation
│           │   ├── CameraScreen.tsx
│           │   ├── CameraViewModel.ts
│           │   └── useCameraViewModel.ts
│           └── services
│               ├── CameraService.ts
│               └── ICameraService.ts
├── App.tsx (navigation dan routing)
├── index.js
└── ...
```

### Arsitektur Feature-First

*   **`android` & `ios`:** Folder proyek asli untuk Android dan iOS.
*   **`src`:** Berisi kode sumber aplikasi dengan arsitektur feature-first yang terstruktur.
    *   **`core`:** Shared infrastructure dan core services yang digunakan across features
        *   **`data`:** Core data layer dengan database dan shared repositories
            *   **`db`:** Penyiapan WatermelonDB, skema, model, dan instance basis data
            *   **`repositories`:** Shared repositories untuk core entities (Post, FCMToken)
        *   **`di` (Dependency Injection):** Dependency injection dan service access
            *   **`context`:** React Context untuk dependency injection dan service orchestration
            *   **`hooks`:** Custom React hooks untuk mengakses core services dan application lifecycle
        *   **`services`:** Core business logic services (FCM, Notifications, Background Sync, Permissions)
    *   **`features`:** Feature-first organization dengan complete isolation per feature
        *   **`home`:** Home screen feature dengan presentation layer
            *   **`presentation`:** HomeScreen, HomeViewModel, dan useHomeViewModel
        *   **`bluetooth`:** Complete Bluetooth printer feature dengan full stack
            *   **`data`:** BluetoothDeviceRepository dan interfaces
            *   **`di`:** Feature-specific dependency injection hooks
            *   **`domain`:** BluetoothUseCase untuk business logic
            *   **`presentation`:** BluetoothScreen, BluetoothViewModel, dan hooks
            *   **`services`:** BluetoothService dan interfaces
            *   **`util`:** Feature-specific utilities dan type definitions
        *   **`camera`:** Complete Camera barcode scanning feature dengan full stack
            *   **`data`:** BarcodeRepository dan interfaces
            *   **`di`:** Feature-specific dependency injection hooks
            *   **`domain`:** CameraUseCase untuk business logic
            *   **`presentation`:** CameraScreen, CameraViewModel, dan hooks
            *   **`services`:** CameraService dan interfaces
*   **`App.tsx`:** Entry point dengan simple navigation system antara HomeScreen, BluetoothScreen, dan CameraScreen
*   **`index.js`:** Entry point aplikasi dengan Firebase module initialization

### Keuntungan Feature-First Architecture

**Complete Feature Isolation:**
- Setiap feature memiliki complete stack sendiri: data, domain, services, presentation
- Feature dapat dikembangkan secara independent tanpa affecting other features
- Clear boundaries antara features dengan minimal cross-dependencies
- Self-contained features dengan own repositories, use cases, dan services

**Scalability:**
- Easy untuk menambah feature baru dengan copy pattern dari existing features
- Feature teams dapat bekerja parallel tanpa conflicts
- Horizontal scaling dengan feature-specific teams
- Vertical scaling dengan complete feature stacks

**Maintainability:**
- Feature-specific logic completely isolated dalam folder masing-masing
- Core services terpusat di `core` folder untuk shared functionality
- Data layer terpisah antara core (shared) dan feature-specific
- Clear separation of concerns dengan clean architecture per feature

**Developer Experience:**
- Feature developers hanya perlu fokus pada satu folder
- Easy onboarding untuk new developers dengan clear feature boundaries
- Consistent patterns across all features
- Self-documenting structure dengan clear folder organization

**Navigation Implementation:**
- Simple state-based navigation system sudah terimplementasi
- Each feature self-contained dengan own state management
- Easy untuk upgrade ke React Navigation jika diperlukan
- Bluetooth printer feature sudah fully integrated dengan complete stack
- Camera barcode scanning feature sudah fully integrated dengan complete stack

## 3. Basis Data Lokal dengan WatermelonDB

Kami menggunakan WatermelonDB untuk menyimpan data secara lokal. Ini adalah basis data reaktif, yang berarti UI akan diperbarui secara otomatis saat data berubah.

### Skema

Skema basis data didefinisikan dalam `src/data/db/schema.ts`. Kami memiliki satu tabel bernama `posts` dengan kolom berikut:

*   `title`: Judul posting (string).
*   `body`: Isi posting (string, opsional).
*   `created_at`: Stempel waktu pembuatan (angka).
*   `updated_at`: Stempel waktu pembaruan (angka).

### Model

Model `Post` didefinisikan dalam `src/data/db/Post.ts`. Ini mewakili satu posting di basis data dan menyediakan metode untuk mengakses dan memodifikasi data.

### Instance Basis Data

Instance basis data dibuat di `src/data/db/index.ts`. Ini menggunakan `SQLiteAdapter` untuk terhubung ke basis data SQLite di perangkat.

## 4. Firebase Cloud Messaging (FCM) dan Notifikasi

Kami telah mengintegrasikan Firebase Cloud Messaging untuk menangani push notifications dan broadcast messaging dengan arsitektur yang bersih dan dapat diuji.

### 4.1. Komponen FCM

#### FCM Token Repository

Repository untuk mengelola penyimpanan FCM token secara lokal:

```typescript
export interface IFCMTokenRepository {
  saveToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  removeToken(): Promise<void>;
  hasToken(): Promise<boolean>;
}
```

**Implementasi (`src/data/repositories/FCMTokenRepository.ts`):**
```typescript
export class FCMTokenRepository implements IFCMTokenRepository {
  private readonly FCM_TOKEN_KEY = '@fcm_token';

  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FCM_TOKEN_KEY, token);
    } catch (error) {
      throw new Error(`Failed to save FCM token: ${error}`);
    }
  }
  // ... implementasi lainnya
}
```

#### Permission Service

Service untuk mengelola izin notifikasi:

```typescript
export interface IPermissionService {
  requestNotificationPermission(): Promise<PermissionStatus>;
  checkNotificationPermission(): Promise<PermissionStatus>;
}
```

**Status Permission:**
- `GRANTED`: Izin diberikan
- `DENIED`: Izin ditolak
- `BLOCKED`: Izin diblokir permanen
- `PROVISIONAL`: Izin sementara (iOS)

#### Notification Service

Service untuk menangani notifikasi lokal dengan pencegahan duplikasi:

```typescript
export interface INotificationService {
  showNotification(notification: NotificationData): Promise<void>;
  cancelNotification(notificationId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  createNotificationChannel(channelId: string, channelName: string, importance?: number): Promise<void>;
}
```

**Fitur Utama:**
- Pencegahan notifikasi duplikasi
- Channel management untuk Android
- Priority dan sound configuration
- Custom data payload support

#### FCM Service

Service utama untuk mengelola Firebase Cloud Messaging:

```typescript
export interface IFCMService {
  initialize(): Promise<void>;
  getToken(): Promise<string | null>;
  onTokenRefresh(callback: (token: string) => void): () => void;
  onMessage(callback: (message: FCMMessage) => void): () => void;
  onBackgroundMessage(callback: (message: FCMMessage) => void): void;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
}
```

### 4.2. Implementasi FCM Service

**Inisialisasi dan Token Management:**
```typescript
export class FCMService implements IFCMService {
  constructor(private fcmTokenRepository: IFCMTokenRepository) {}

  async initialize(): Promise<void> {
    try {
      const token = await messaging().getToken();
      if (token) {
        await this.fcmTokenRepository.saveToken(token);
        console.log('FCM Token saved:', token);
      }
    } catch (error) {
      throw new Error(`Failed to initialize FCM service: ${error}`);
    }
  }
}
```

**Message Handling:**
```typescript
onMessage(callback: (message: FCMMessage) => void): () => void {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    const fcmMessage: FCMMessage = {
      messageId: remoteMessage.messageId,
      notification: remoteMessage.notification ? {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
      } : undefined,
      data: remoteMessage.data,
    };
    callback(fcmMessage);
  });

  return unsubscribe;
}
```

### 4.3. Dependency Injection untuk FCM

Semua service FCM diregistrasi dalam ServiceContext:

```typescript
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const postRepository = new PostRepository();
  const fcmTokenRepository = new FCMTokenRepository();
  const backgroundSyncService = new BackgroundSyncService(postRepository);
  const permissionService = new PermissionService();
  const notificationService = new NotificationService();
  const fcmService = new FCMService(fcmTokenRepository);

  const services: ServiceContextType = {
    postRepository,
    fcmTokenRepository,
    backgroundSyncService,
    permissionService,
    notificationService,
    fcmService,
  };

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};
```

### 4.4. Custom Hooks untuk FCM

**usePermission Hook:**
```typescript
export const usePermission = () => {
  const { permissionService } = useServices();
  return permissionService;
};
```

**useNotification Hook:**
```typescript
export const useNotification = () => {
  const { notificationService } = useServices();
  return notificationService;
};
```

**useFCM Hook:**
```typescript
export const useFCM = () => {
  const { fcmService } = useServices();
  return fcmService;
};
```

**useFCMToken Hook:**
```typescript
export const useFCMToken = () => {
  const { fcmTokenRepository } = useServices();
  return fcmTokenRepository;
};
```

### 4.5. Integrasi FCM dalam UI

FCM terintegrasi dalam `HomeScreen.tsx` melalui `useHomeViewModel` hook dengan UI yang bersih:

```typescript
const AppContent = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<FCMMessage[]>([]);
  
  const permissionService = usePermission();
  const notificationService = useNotification();
  const fcmService = useFCM();

  useEffect(() => {
    const initializeFCM = async () => {
      await fcmService.initialize();
      const token = await fcmService.getToken();
      setFcmToken(token);
    };

    const setupFCMListeners = () => {
      const unsubscribeOnMessage = fcmService.onMessage((message: FCMMessage) => {
        setReceivedMessages(prev => [message, ...prev.slice(0, 2)]);
        
        if (message.notification) {
          showLocalNotification(
            message.notification.title || 'FCM Message',
            message.notification.body || 'You have a new message'
          );
        }
      });

      return unsubscribeOnMessage;
    };

    initializeFCM();
    setupFCMListeners();
  }, []);
};
```

### 4.6. Fitur UI FCM

**Permission Management:**
- Status indicator dengan color coding
- Request permission button
- Real-time permission status updates

**Notification Testing:**
- Test notification button untuk testing lokal
- FCM token display untuk testing server-side
- Recent messages display (menampilkan 2 pesan terakhir)

**Message Handling:**
- Automatic local notification creation dari FCM messages
- Background message processing
- Token refresh handling

### 4.7. Keuntungan Implementasi FCM

**Separation of Concerns:**
- Repository pattern untuk token storage
- Service layer untuk business logic
- UI layer hanya untuk presentation

**Testability:**
- Interface-based design memudahkan mocking
- Dependency injection untuk isolated testing
- Error handling yang proper di setiap layer

**Maintainability:**
- Clean architecture dengan single responsibility
- Custom hooks untuk easy access
- Consistent patterns dengan existing codebase

**Reliability:**
- Duplicate notification prevention
- Proper error handling dan logging
- Token refresh management
- Background message processing

## 6. Bluetooth Printer Integration

Aplikasi telah diintegrasikan dengan fitur Bluetooth printer menggunakan `react-native-thermal-printer` library dengan arsitektur yang bersih dan dapat diuji.

### 6.1. Komponen Bluetooth

#### Bluetooth Service Interface (`src/features/bluetooth/services/IBluetoothService.ts`)

Interface untuk mengelola koneksi dan printing ke thermal printer:

```typescript
export interface IBluetoothService {
  isBluetoothEnabled(): Promise<boolean>;
  enableBluetooth(): Promise<boolean>;
  scanForDevices(): Promise<BluetoothDevice[]>;
  connectToDevice(address: string): Promise<boolean>;
  disconnect(): Promise<void>;
  printText(text: string): Promise<void>;
  printImage(imagePath: string): Promise<void>;
  printFormattedReceipt(receiptData: ReceiptData): Promise<void>;
  isConnected(): Promise<boolean>;
  printQRCode(content: string, size?: number): Promise<void>;
  printBarcode(content: string): Promise<void>;
  getConnectedDevice(): BluetoothDevice | null;
}
```

#### Bluetooth Device Repository (`src/features/bluetooth/data/IBluetoothDeviceRepository.ts`)

Repository untuk mengelola data perangkat Bluetooth yang tersimpan:

```typescript
export interface IBluetoothDeviceRepository {
  saveDevice(device: BluetoothDevice): Promise<void>;
  getDevices(): Promise<BluetoothDevice[]>;
  removeDevice(address: string): Promise<void>;
  updateLastConnected(address: string): Promise<void>;
  getLastConnectedDevice(): Promise<BluetoothDevice | null>;
}
```

#### Bluetooth Use Case (`src/features/bluetooth/domain/BluetoothUseCase.ts`)

Use case layer untuk business logic Bluetooth operations:

```typescript
export class BluetoothUseCase {
  constructor(
    private bluetoothService: IBluetoothService,
    private bluetoothDeviceRepository: IBluetoothDeviceRepository
  ) {}

  async scanAndSaveDevices(): Promise<BluetoothDevice[]> {
    const devices = await this.bluetoothService.scanForDevices();
    
    for (const device of devices) {
      await this.bluetoothDeviceRepository.saveDevice(device);
    }
    
    return devices;
  }

  async connectToLastDevice(): Promise<boolean> {
    const lastDevice = await this.bluetoothDeviceRepository.getLastConnectedDevice();
    if (lastDevice) {
      return await this.bluetoothService.connectToDevice(lastDevice.address);
    }
    return false;
  }
}
```

### 6.2. Bluetooth Service Implementation (`src/features/bluetooth/services/BluetoothService.ts`)

**Mock-Friendly Implementation:**
```typescript
export class BluetoothService implements IBluetoothService {
  private connectedDevice: BluetoothDevice | null = null;
  private currentPrinter: IBLEPrinter | null = null;

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      // Check if BLEPrinter.deviceList is available
      if (!BLEPrinter || typeof BLEPrinter.deviceList !== 'function') {
        console.warn('BLEPrinter.deviceList is not available - returning mock devices for development');
        return [
          {
            name: 'Mock Thermal Printer 1',
            address: '00:11:22:33:44:55',
            paired: true
          },
          {
            name: 'Mock Thermal Printer 2', 
            address: '00:11:22:33:44:56',
            paired: true
          }
        ];
      }

      const devices = await BLEPrinter.deviceList();
      return devices.map((device: any) => ({
        name: device.device_name || device.inner_mac_address || 'Unknown Device',
        address: device.inner_mac_address || device.device_id,
        paired: true
      }));
    } catch (error) {
      console.error('Error scanning for devices:', error);
      return [
        {
          name: 'Mock Thermal Printer (Error Recovery)',
          address: '00:11:22:33:44:99',
          paired: true
        }
      ];
    }
  }

  async connectToDevice(address: string): Promise<boolean> {
    try {
      // Check if BLEPrinter constructor is available
      if (!BLEPrinter) {
        console.warn('BLEPrinter class is not available - simulating connection for development');
        const devices = await this.scanForDevices();
        const device = devices.find(d => d.address === address);
        
        if (device) {
          this.connectedDevice = device;
          console.log(`Mock connection established to: ${device.name}`);
          return true;
        }
        return false;
      }

      this.currentPrinter = new BLEPrinter();
      const payload = { inner_mac_address: address };
      await this.currentPrinter.connectPrinter(payload);
      
      const devices = await this.scanForDevices();
      const device = devices.find(d => d.address === address);
      
      if (device) {
        this.connectedDevice = device;
        return true;
      }
      
      return false;
    } catch (error) {
      // Graceful fallback for development
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('prototype') || errorMessage.includes('undefined')) {
        console.warn('Library linking issue detected - simulating connection for development');
        const devices = await this.scanForDevices();
        const device = devices.find(d => d.address === address);
        
        if (device) {
          this.connectedDevice = device;
          console.log(`Mock connection established to: ${device.name}`);
          return true;
        }
      }
      
      throw new Error(`Connection failed: ${errorMessage}`);
    }
  }
}
```

### 6.3. Bluetooth Screen Implementation (`src/features/bluetooth/presentation/`)

**BluetoothViewModel dengan MVI Pattern (`BluetoothViewModel.ts`):**
```typescript
export class BluetoothViewModel {
  constructor(
    private bluetoothUseCase: BluetoothUseCase,
    private dispatch: (action: BluetoothAction) => void
  ) {}

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

  async scanForDevices(): Promise<void> {
    this.dispatch({ type: 'SCAN_START' });
    try {
      const devices = await this.bluetoothUseCase.scanAndSaveDevices();
      this.dispatch({ type: 'SCAN_SUCCESS', payload: devices });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Scan failed';
      this.dispatch({ type: 'SCAN_ERROR', payload: errorMessage });
    }
  }
}
```

**BluetoothScreen dengan Enhanced UI (`BluetoothScreen.tsx`):**
```typescript
export const BluetoothScreen = ({ onNavigateBack }: BluetoothScreenProps) => {
  const { state, actions } = useBluetoothViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bluetooth Printer</Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Bluetooth:</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: state.bluetoothEnabled ? '#4CAF50' : '#F44336' 
          }]}>
            <Text style={styles.statusText}>
              {state.bluetoothEnabled ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.devicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          <TouchableOpacity 
            style={[styles.scanButton, state.isScanning && styles.disabledButton]}
            onPress={actions.scanForDevices}
            disabled={state.isScanning}
          >
            <Text style={styles.scanButtonText}>
              {state.isScanning ? 'Scanning...' : 'Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={state.availableDevices}
          keyExtractor={(device) => device.address}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.deviceItem,
                state.connectedDevice?.address === item.address && styles.connectedDevice
              ]}
              onPress={() => actions.connectToDevice(item.address)}
              disabled={state.isConnecting}
            >
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceAddress}>{item.address}</Text>
              </View>
              {state.connectedDevice?.address === item.address && (
                <Text style={styles.connectedText}>Connected</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};
```

### 6.4. Navigation Implementation

**Simple State-Based Navigation:**
```typescript
type Screen = 'home' | 'bluetooth' | 'camera';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigateToBluetooth={() => setCurrentScreen('bluetooth')}
            onNavigateToCamera={() => setCurrentScreen('camera')}
          />
        );
      case 'bluetooth':
        return <BluetoothScreen onNavigateBack={() => setCurrentScreen('home')} />;
      case 'camera':
        return <CameraScreen onNavigateBack={() => setCurrentScreen('home')} />;
      default:
        return (
          <HomeScreen 
            onNavigateToBluetooth={() => setCurrentScreen('bluetooth')}
            onNavigateToCamera={() => setCurrentScreen('camera')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <ServiceProvider>
        {renderScreen()}
      </ServiceProvider>
    </SafeAreaProvider>
  );
};
```

**Enhanced HomeScreen dengan Feature Cards:**
```typescript
<View style={styles.featuresSection}>
  {onNavigateToBluetooth && (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={onNavigateToBluetooth}
    >
      <View style={styles.featureCardContent}>
        <Text style={styles.featureCardTitle}>🖨️ Bluetooth Printer</Text>
        <Text style={styles.featureCardSubtitle}>Connect and print to thermal printers</Text>
      </View>
      <Text style={styles.featureCardArrow}>→</Text>
    </TouchableOpacity>
  )}
  
  {onNavigateToCamera && (
    <TouchableOpacity 
      style={[styles.featureCard, styles.cameraCard]} 
      onPress={onNavigateToCamera}
    >
      <View style={styles.featureCardContent}>
        <Text style={styles.featureCardTitle}>📷 Barcode Scanner</Text>
        <Text style={styles.featureCardSubtitle}>Scan barcodes with camera</Text>
      </View>
      <Text style={styles.featureCardArrow}>→</Text>
    </TouchableOpacity>
  )}
</View>
```

### 6.5. Type Definitions

**Custom Type Definitions untuk react-native-thermal-printer (`src/features/bluetooth/util/types/react-native-thermal-printer.d.ts`):**
```typescript
declare module 'react-native-thermal-printer' {
  export interface PrinterDevice {
    device_name?: string;
    inner_mac_address?: string;
    device_id?: string;
  }

  export interface IBLEPrinter {
    connectPrinter(payload: ConnectPayload): Promise<void>;
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
```

### 6.6. Keuntungan Implementasi Bluetooth

**Development-Friendly:**
- Mock devices untuk development tanpa hardware
- Graceful fallback jika library tidak ter-link
- Console logging untuk debugging
- Error recovery dengan mock connections

**Production-Ready:**
- Full thermal printer support dengan BLE connection
- Receipt formatting dengan thermal printer tags
- Image dan QR code printing capabilities
- Connection management dengan proper cleanup

**Clean Architecture:**
- Repository pattern untuk device storage
- Use case layer untuk business logic
- Service layer untuk hardware abstraction
- MVI pattern untuk predictable state management

**User Experience:**
- Loading states untuk semua operations
- Error handling dengan user feedback
- Connection status indicators
- Device list dengan scan functionality
- Prominent navigation dari HomeScreen

## 7. Camera Barcode Scanning Integration

Aplikasi telah diintegrasikan dengan fitur camera barcode scanning menggunakan `react-native-vision-camera` library dengan arsitektur yang bersih dan dapat diuji.

### 7.1. Komponen Camera

#### Camera Service Interface (`src/features/camera/services/ICameraService.ts`)

Interface untuk mengelola camera permissions dan barcode scanning:

```typescript
export interface ICameraService {
  requestCameraPermission(): Promise<CameraPermissionStatus>;
  checkCameraPermission(): Promise<CameraPermissionStatus>;
  startBarcodeScanning(): Promise<void>;
  stopBarcodeScanning(): Promise<void>;
  onBarcodeDetected(callback: (barcode: BarcodeResult) => void): () => void;
  isCameraAvailable(): Promise<boolean>;
}
```

#### Barcode Repository (`src/features/camera/data/IBarcodeRepository.ts`)

Repository untuk mengelola data barcode yang terscan:

```typescript
export interface IBarcodeRepository {
  saveBarcodeResult(value: string, type: string): Promise<BarcodeData>;
  getBarcodeHistory(): Promise<BarcodeData[]>;
  clearBarcodeHistory(): Promise<void>;
  getLastScannedBarcode(): Promise<BarcodeData | null>;
}
```

#### Camera Use Case (`src/features/camera/domain/CameraUseCase.ts`)

Use case layer untuk business logic camera operations:

```typescript
export class CameraUseCase {
  constructor(
    private cameraService: ICameraService,
    private barcodeRepository: IBarcodeRepository
  ) {}

  async requestCameraPermissionWithFeedback(): Promise<CameraPermissionStatus> {
    const permissionStatus = await this.cameraService.requestCameraPermission();
    
    if (!permissionStatus.granted) {
      console.warn('Camera permission not granted:', permissionStatus.status);
    }
    
    return permissionStatus;
  }

  async startScanningWithCallback(
    onBarcodeDetected: (barcode: BarcodeData) => void
  ): Promise<() => void> {
    await this.cameraService.startBarcodeScanning();
    
    const unsubscribe = this.cameraService.onBarcodeDetected(async (barcode: BarcodeResult) => {
      const savedBarcode = await this.barcodeRepository.saveBarcodeResult(
        barcode.value,
        barcode.type
      );
      onBarcodeDetected(savedBarcode);
    });

    return () => {
      unsubscribe();
      this.cameraService.stopBarcodeScanning();
    };
  }
}
```

### 7.2. Camera Service Implementation (`src/features/camera/services/CameraService.ts`)

**Production-Ready Implementation:**
```typescript
export class CameraService implements ICameraService {
  private barcodeCallbacks: ((barcode: BarcodeResult) => void)[] = [];
  private isScanning = false;

  async requestCameraPermission(): Promise<CameraPermissionStatus> {
    try {
      const permission = await Camera.requestCameraPermission();
      
      return {
        granted: permission === 'granted',
        canAskAgain: permission !== 'denied',
        status: permission as 'granted' | 'denied' | 'restricted' | 'not-determined'
      };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await Camera.getAvailableCameraDevices();
      return devices.length > 0;
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }
}
```

### 7.3. Camera Screen Implementation (`src/features/camera/presentation/`)

**CameraViewModel dengan MVI Pattern (`CameraViewModel.ts`):**
```typescript
export class CameraViewModel {
  constructor(
    private cameraUseCase: CameraUseCase,
    private dispatch: (action: CameraAction) => void
  ) {}

  async initializeCamera(): Promise<void> {
    this.dispatch({ type: 'INITIALIZATION_START' });
    try {
      const { available, permission } = await this.cameraUseCase.checkCameraAvailabilityAndPermission();
      
      this.dispatch({
        type: 'INITIALIZATION_SUCCESS',
        payload: {
          cameraPermission: permission,
          isCameraAvailable: available
        }
      });

      const history = await this.cameraUseCase.getBarcodeHistory();
      history.forEach(barcode => {
        this.dispatch({ type: 'BARCODE_DETECTED', payload: barcode });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Camera initialization failed';
      this.dispatch({ type: 'INITIALIZATION_ERROR', payload: errorMessage });
    }
  }

  async startScanning(): Promise<void> {
    try {
      this.dispatch({ type: 'START_SCANNING' });
      
      this.scanningUnsubscribe = await this.cameraUseCase.startScanningWithCallback(
        (barcode: BarcodeData) => {
          this.dispatch({ type: 'BARCODE_DETECTED', payload: barcode });
          this.dispatch({ type: 'SHOW_BARCODE_DIALOG', payload: barcode });
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start scanning';
      this.dispatch({ type: 'SET_ERROR', payload: errorMessage });
      this.dispatch({ type: 'STOP_SCANNING' });
    }
  }
}
```

**CameraScreen dengan Enhanced UI (`CameraScreen.tsx`):**
```typescript
export const CameraScreen = ({ onNavigateBack }: CameraScreenProps) => {
  const { state, actions } = useCameraViewModel();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'code-93', 'codabar', 'upc-a', 'upc-e'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && state.isScanning) {
        const code = codes[0];
        // Handle barcode detection
        Alert.alert(
          'Barcode Detected',
          `Value: ${code.value}\nType: ${code.type}`,
          [{ text: 'OK', onPress: () => actions.stopScanning() }]
        );
      }
    },
  });

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
          <View style={styles.scanArea} />
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
          renderItem={({ item }) => (
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
    </SafeAreaView>
  );
};
```

### 7.4. Navigation Implementation

**Enhanced Navigation dengan Camera Screen:**
```typescript
type Screen = 'home' | 'bluetooth' | 'camera';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigateToBluetooth={() => setCurrentScreen('bluetooth')}
            onNavigateToCamera={() => setCurrentScreen('camera')}
          />
        );
      case 'bluetooth':
        return <BluetoothScreen onNavigateBack={() => setCurrentScreen('home')} />;
      case 'camera':
        return <CameraScreen onNavigateBack={() => setCurrentScreen('home')} />;
      default:
        return (
          <HomeScreen 
            onNavigateToBluetooth={() => setCurrentScreen('bluetooth')}
            onNavigateToCamera={() => setCurrentScreen('camera')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <ServiceProvider>
        {renderScreen()}
      </ServiceProvider>
    </SafeAreaProvider>
  );
};
```

**Enhanced HomeScreen dengan Camera Card:**
```typescript
<View style={styles.featuresSection}>
  {onNavigateToBluetooth && (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={onNavigateToBluetooth}
    >
      <View style={styles.featureCardContent}>
        <Text style={styles.featureCardTitle}>🖨️ Bluetooth Printer</Text>
        <Text style={styles.featureCardSubtitle}>Connect and print to thermal printers</Text>
      </View>
      <Text style={styles.featureCardArrow}>→</Text>
    </TouchableOpacity>
  )}
  
  {onNavigateToCamera && (
    <TouchableOpacity 
      style={[styles.featureCard, styles.cameraCard]} 
      onPress={onNavigateToCamera}
    >
      <View style={styles.featureCardContent}>
        <Text style={styles.featureCardTitle}>📷 Barcode Scanner</Text>
        <Text style={styles.featureCardSubtitle}>Scan barcodes with camera</Text>
      </View>
      <Text style={styles.featureCardArrow}>→</Text>
    </TouchableOpacity>
  )}
</View>
```

### 7.5. Supported Barcode Formats

Camera screen mendukung berbagai format barcode:

- **QR Code**: Quick Response codes
- **EAN-13**: European Article Number (13 digits)
- **EAN-8**: European Article Number (8 digits)
- **Code-128**: High-density linear barcode
- **Code-39**: Variable length alphanumeric barcode
- **Code-93**: Compact alphanumeric barcode
- **Codabar**: Numeric barcode with start/stop characters
- **UPC-A**: Universal Product Code (12 digits)
- **UPC-E**: Compressed UPC-A format

### 7.6. Keuntungan Implementasi Camera

**Development-Friendly:**
- Permission management dengan user-friendly flow
- Real-time barcode detection dengan visual feedback
- Scan history dengan persistent storage
- Error handling dengan proper user feedback

**Production-Ready:**
- Full camera integration dengan react-native-vision-camera
- Multiple barcode format support
- Permission handling untuk Android dan iOS
- Camera availability detection
- Proper cleanup dan memory management

**Clean Architecture:**
- Repository pattern untuk barcode data storage
- Use case layer untuk business logic
- Service layer untuk camera abstraction
- MVI pattern untuk predictable state management

**User Experience:**
- Loading states untuk semua operations
- Permission request flow dengan clear messaging
- Visual scan area dengan overlay
- Scan history dengan clear functionality
- Real-time barcode detection feedback
- Prominent navigation dari HomeScreen

## 5. Arsitektur MVI (Model-View-Intent) dengan Feature-Based Structure

Proyek ini telah direfactor menggunakan pola MVI (Model-View-Intent) dengan feature-based architecture, clean code, dependency injection, dan service orchestration untuk meningkatkan maintainability, testability, dan scalability. Aplikasi sekarang menggunakan feature-specific ViewModel classes dan specialized service classes untuk mengelola initialization, message handling, dan notification management.

### 5.1. Feature-Based MVI Implementation

Aplikasi menggunakan feature-based MVI pattern dengan setiap screen memiliki ViewModel sendiri:

#### HomeViewModel Class (`src/presentation/screen/home/HomeViewModel.ts`)

ViewModel class untuk Home screen yang mengelola state dan business logic:

```typescript
export class HomeViewModel {
  private services: any;
  private backgroundSyncService: any;
  private appInitialization: any;
  private consoleLogger: any;
  private dispatch: (action: HomeAction) => void;

  constructor(
    services: any,
    backgroundSyncService: any,
    appInitialization: any,
    consoleLogger: any,
    dispatch: (action: HomeAction) => void
  ) {
    this.services = services;
    this.backgroundSyncService = backgroundSyncService;
    this.appInitialization = appInitialization;
    this.consoleLogger = consoleLogger;
    this.dispatch = dispatch;
  }

  getInitialState(): HomeState {
    return {
      isInitialized: false,
      initializationError: null,
      fcmToken: null,
      permissionStatus: null,
      permissionStatusColor: '#9E9E9E',
      receivedMessages: [],
      logs: [],
      isRequestingPermission: false,
      isSendingTestNotification: false,
      isPerformingSync: false,
      error: null,
    };
  }

  reducer(state: HomeState, action: HomeAction): HomeState {
    switch (action.type) {
      case 'INITIALIZATION_START':
        return { 
          ...state, 
          isInitialized: false, 
          initializationError: null,
          error: null 
        };
      // ... other action handlers
    }
  }

  async performManualSync(): Promise<void> {
    this.dispatch({ type: 'PERFORM_SYNC_START' });
    try {
      console.log('Manual trigger pressed');
      await this.backgroundSyncService.performSyncTask('manual');
      this.dispatch({ type: 'PERFORM_SYNC_SUCCESS' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      this.dispatch({ type: 'PERFORM_SYNC_ERROR', payload: errorMessage });
    }
  }
}
```

#### useHomeViewModel Hook (`src/presentation/screen/home/useHomeViewModel.ts`)

React hook yang menggunakan HomeViewModel class dengan dependency injection internal:

```typescript
export function useHomeViewModel() {
  const services = useServices();
  const backgroundSyncService = useBackgroundSync();
  const appInitialization = useAppInitialization();
  const consoleLogger = useConsoleLogger();

  const viewModel = useMemo(() => {
    return new HomeViewModel(
      services,
      backgroundSyncService,
      appInitialization,
      consoleLogger,
      (action) => dispatch(action)
    );
  }, [services, backgroundSyncService, appInitialization, consoleLogger]);

  const [state, dispatch] = useReducer(
    (currentState, action) => viewModel.reducer(currentState, action),
    viewModel.getInitialState()
  );

  const computedState = useMemo(() => viewModel.computeState(state), [viewModel, state]);

  return {
    state: computedState,
    actions: {
      performManualSync: () => viewModel.performManualSync(),
      requestNotificationPermission: () => viewModel.requestNotificationPermission(),
      sendTestNotification: () => viewModel.sendTestNotification(),
      showFCMToken: () => viewModel.showFCMToken(),
      clearError: () => viewModel.clearError(),
    },
  };
}
```

#### Backward Compatibility Hook (`src/di/hooks/useAppViewModel.ts`)

Untuk backward compatibility, useAppViewModel sekarang redirect ke useHomeViewModel:

```typescript
// @deprecated Use useHomeViewModel from src/presentation/screen/home/useHomeViewModel.ts instead
// This file is kept for backward compatibility and will be removed in future versions
export { useHomeViewModel as useAppViewModel } from '../../presentation/screen/home/useHomeViewModel';
```

#### MVI Pattern Benefits

**Model (State Management):**
- Immutable state dengan TypeScript types
- Centralized state management dengan reducer pattern
- Clear state transitions dengan action-based updates

**View (React Components):**
- Clean separation antara UI dan business logic
- View hanya consume state dan call actions
- No direct state manipulation dalam components

**Intent (User Actions):**
- All user interactions melalui action methods
- Async operations handled dalam ViewModel
- Error handling dan loading states managed centrally

**Feature-Based ViewModel Advantages:**
- **Feature Isolation**: Setiap screen memiliki ViewModel sendiri yang terisolasi
- **Scalable Architecture**: Mudah menambah screen baru dengan pattern yang sama
- **Self-contained**: Dependency injection handled internally dalam hook
- **Type Safety**: Strong typing untuk state dan actions per feature
- **Testability**: ViewModel class mudah untuk unit testing secara isolated
- **Maintainability**: Business logic terpusat per feature dalam class methods
- **Navigation Ready**: Struktur siap untuk multi-screen navigation

### 5.2. Service Orchestration dengan Specialized Classes

Kami menggunakan specialized service classes untuk mengelola kompleksitas aplikasi:

#### AppInitializer Service (`src/services/AppInitializer.ts`)

Service yang bertanggung jawab untuk menginisialisasi semua services aplikasi dengan urutan yang benar:

```typescript
export class AppInitializer {
  constructor(
    private fcmService: IFCMService,
    private permissionService: IPermissionService,
    private backgroundSyncService: IBackgroundSyncService
  ) {}

  async initializeAllServices(): Promise<void> {
    try {
      await FirebaseInitializer.initialize();
      
      await Promise.all([
        this.backgroundSyncService.configureBackgroundFetch(),
        this.initializeFCM(),
        this.checkInitialPermissionStatus()
      ]);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }
}
```

#### FCMMessageHandler Service (`src/services/FCMMessageHandler.ts`)

Service khusus untuk menangani FCM message processing dan local notification creation:

```typescript
export class FCMMessageHandler {
  constructor(
    private fcmService: IFCMService,
    private notificationService: INotificationService
  ) {}

  setupMessageListeners(
    onMessageReceived: (message: FCMMessage) => void,
    onTokenRefresh: (token: string) => void
  ): void {
    const unsubscribeOnMessage = this.fcmService.onMessage((message: FCMMessage) => {
      onMessageReceived(message);
      
      if (message.notification) {
        this.showLocalNotificationFromFCM(
          message.notification.title || 'FCM Message',
          message.notification.body || 'You have a new message'
        );
      }
    });
  }
}
```

#### NotificationManager Service (`src/services/NotificationManager.ts`)

Service untuk mengelola notification permissions dan user feedback:

```typescript
export class NotificationManager {
  constructor(
    private notificationService: INotificationService,
    private permissionService: IPermissionService
  ) {}

  async sendTestNotification(): Promise<void> {
    let hasPermissions = await this.notificationService.checkNotificationPermissions();
    
    if (!hasPermissions) {
      hasPermissions = await this.notificationService.requestNotificationPermissions();
      if (!hasPermissions) {
        Alert.alert('Permission Required', 'Notification permissions are required');
        return;
      }
    }

    await this.notificationService.showNotification({
      id: `test_notification_${Date.now()}`,
      title: 'Test Notification',
      body: 'This is a test notification from the app',
      channelId: 'default',
      priority: 'high',
    });
  }
}
```

#### ServiceContext dengan Service Orchestration (`src/core/di/context/ServiceContext.tsx`)

```typescript
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  // Core repositories
  const postRepository = new PostRepository();
  const fcmTokenRepository = new FCMTokenRepository();
  
  // Feature-specific repositories
  const bluetoothDeviceRepository = new BluetoothDeviceRepository();
  const barcodeRepository = new BarcodeRepository();
  
  // Core services
  const backgroundSyncService = new BackgroundSyncService(postRepository);
  const permissionService = new PermissionService();
  const notificationService = new NotificationService();
  const fcmService = new FCMService(fcmTokenRepository);
  
  // Feature-specific services
  const bluetoothService = new BluetoothService(bluetoothDeviceRepository);
  const cameraService = new CameraService();
  
  // Use cases
  const bluetoothUseCase = new BluetoothUseCase(bluetoothService, bluetoothDeviceRepository);
  const cameraUseCase = new CameraUseCase(cameraService, barcodeRepository);
  
  // Service Orchestrators
  const appInitializer = new AppInitializer(fcmService, permissionService, backgroundSyncService);
  const fcmMessageHandler = new FCMMessageHandler(fcmService, notificationService);
  const notificationManager = new NotificationManager(notificationService, permissionService);

  const services: ServiceContextType = {
    // Core
    postRepository,
    fcmTokenRepository,
    backgroundSyncService,
    permissionService,
    notificationService,
    fcmService,
    
    // Features
    bluetoothDeviceRepository,
    barcodeRepository,
    bluetoothService,
    cameraService,
    bluetoothUseCase,
    cameraUseCase,
    
    // Orchestrators
    appInitializer,
    fcmMessageHandler,
    notificationManager,
  };

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};
```

**Keuntungan Service Orchestration:**
- **Single Responsibility**: Setiap service memiliki tanggung jawab yang spesifik
- **Dependency Injection**: Services di-inject melalui constructor
- **Error Handling**: Centralized error handling di setiap orchestrator
- **Testability**: Mudah untuk mock individual services
- **Maintainability**: Logic terpisah dan mudah dimodifikasi

### 5.3. Repository Pattern

Repository pattern memisahkan logic akses data dari business logic:

#### IPostRepository Interface (`src/data/repositories/interfaces/IPostRepository.ts`)

```typescript
export interface IPostRepository {
  createPost(title: string): Promise<void>;
  getAllPosts(): Promise<any[]>;
  deletePost(id: string): Promise<void>;
}
```

#### PostRepository Implementation (`src/data/repositories/PostRepository.ts`)

```typescript
export class PostRepository implements IPostRepository {
  async createPost(title: string): Promise<void> {
    const postsCollection = database.collections.get('posts');
    await database.write(async () => {
      await postsCollection.create(post => {
        post.title = title;
      });
    });
  }
  // ... implementasi lainnya
}
```

**Keuntungan:**
- Abstraksi layer database
- Mudah untuk unit testing
- Dapat diganti implementasinya tanpa mengubah business logic
- Separation of concerns yang jelas

### 5.4. Service Layer Architecture

Service layer menangani business logic dan orchestration:

#### IBackgroundSyncService Interface (`src/services/interfaces/IBackgroundSyncService.ts`)

```typescript
export interface IBackgroundSyncService {
  configureBackgroundFetch(): Promise<void>;
  performSyncTask(taskId: string): Promise<void>;
}
```

#### BackgroundSyncService Implementation (`src/services/BackgroundSync.ts`)

```typescript
export class BackgroundSyncService implements IBackgroundSyncService {
  constructor(private postRepository: IPostRepository) {}

  async performSyncTask(taskId: string): Promise<void> {
    try {
      const newPostTitle = `New Post ${new Date().toISOString()}`;
      await this.postRepository.createPost(newPostTitle);
      console.log('[BackgroundFetch] Sync completed successfully');
    } catch (error) {
      console.error('[BackgroundFetch] Sync failed:', error);
    } finally {
      BackgroundFetch.finish(taskId);
    }
  }
  // ... implementasi lainnya
}
```

**Keuntungan:**
- Constructor injection untuk dependencies
- Error handling yang proper
- Business logic terisolasi
- Mudah untuk testing dan mocking

### 5.5. Application Lifecycle Hooks

Custom hooks untuk mengelola application lifecycle dan initialization:

#### useAppInitialization Hook (`src/core/di/hooks/useAppInitialization.ts`)

Hook yang mengelola initialization process dan application state:

```typescript
export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<FCMMessage[]>([]);

  const services = useServices();
  
  const appInitializer = new AppInitializer(
    services.fcmService,
    services.permissionService,
    services.backgroundSyncService
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await appInitializer.initializeAllServices();
        
        const token = await services.fcmService.getToken();
        setFcmToken(token);
        
        const status = await services.permissionService.checkNotificationPermission();
        setPermissionStatus(status);

        fcmMessageHandler.setupMessageListeners(
          (message: FCMMessage) => {
            setReceivedMessages(prev => [message, ...prev.slice(0, 2)]);
          },
          (token: string) => {
            setFcmToken(token);
          }
        );

        setIsInitialized(true);
      } catch (error) {
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeApp();
  }, []);

  return {
    isInitialized,
    initializationError,
    fcmToken,
    permissionStatus,
    receivedMessages,
    setPermissionStatus
  };
};
```

#### useConsoleLogger Hook (`src/core/di/hooks/useConsoleLogger.ts`)

Hook untuk menangkap dan menampilkan console logs dalam UI:

```typescript
export const useConsoleLogger = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const logListener = (message: string) => {
      setLogs((prevLogs) => [...prevLogs, message]);
    };

    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      logListener(args.join(' '));
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return { logs };
};
```

#### Service Access Hooks

```typescript
export const useBackgroundSync = () => {
  const { backgroundSyncService } = useServices();
  return backgroundSyncService;
};

export const usePostRepository = () => {
  const { postRepository } = useServices();
  return postRepository;
};
```

**Keuntungan Application Lifecycle Hooks:**
- **Centralized Initialization**: Semua initialization logic dalam satu hook
- **State Management**: Mengelola application state secara terpusat
- **Error Handling**: Proper error handling untuk initialization failures
- **Loading States**: Menyediakan loading dan error states untuk UI
- **Message Handling**: Automatic setup untuk FCM message listeners

### 5.6. Factory Pattern

Factory pattern untuk manual service creation jika diperlukan:

```typescript
export class BackgroundSyncFactory {
  static createBackgroundSyncService(): IBackgroundSyncService {
    const postRepository = new PostRepository();
    return new BackgroundSyncService(postRepository);
  }
}
```

## 7. Tugas Latar Belakang dengan `react-native-background-fetch`

Kami menggunakan `react-native-background-fetch` untuk menjadwalkan dan menjalankan tugas latar belakang.

### 7.1. Konfigurasi

Pustaka sekarang dikonfigurasi melalui `BackgroundSyncService` class di `src/services/BackgroundSync.ts`. Method `configureBackgroundFetch` mengambil parameter berikut:

*   **`minimumFetchInterval`:** Interval minimum dalam menit di mana tugas latar belakang dapat dieksekusi. Nilai defaultnya adalah 15 menit.
*   **`taskId`:** Pengidentifikasi unik untuk tugas tersebut.
*   **`stopOnTerminate`:** (Hanya Android) Jika `true`, tugas latar belakang akan dihentikan saat aplikasi dihentikan. Nilai defaultnya adalah `false`.
*   **`startOnBoot`:** (Hanya Android) Jika `true`, tugas latar belakang akan dimulai saat perangkat dinyalakan. Nilai defaultnya adalah `true`.
*   **`requiredNetworkType`:** Jenis jaringan yang diperlukan agar tugas latar belakang dapat berjalan. Nilai yang mungkin adalah:
    *   `BackgroundFetch.NETWORK_TYPE_NONE`: Tidak diperlukan koneksi jaringan.
    *   `BackgroundFetch.NETWORK_TYPE_ANY`: Diperlukan koneksi jaringan apa pun.
    *   `BackgroundFetch.NETWORK_TYPE_UNMETERED`: Diperlukan koneksi jaringan tanpa kuota.
*   **`requiresCharging`:** Jika `true`, tugas latar belakang hanya akan berjalan saat perangkat sedang diisi daya. Nilai defaultnya adalah `false`.
*   **`requiresDeviceIdle`:** (Hanya Android) Jika `true`, tugas latar belakang hanya akan berjalan saat perangkat dalam keadaan diam. Nilai defaultnya adalah `false`.
*   **`requiresBatteryNotLow`:** Jika `true`, tugas latar belakang hanya akan berjalan saat baterai tidak lemah. Nilai defaultnya adalah `false`.
*   **`requiresStorageNotLow`:** Jika `true`, tugas latar belakang hanya akan berjalan saat penyimpanan tidak rendah. Nilai defaultnya adalah `false`.

### 7.2. Menjadwalkan Tugas

Dengan arsitektur baru, penjadwalan tugas dilakukan melalui service layer:

**Manual Trigger melalui Service:**
```typescript
const backgroundSyncService = useBackgroundSync();

const manualTrigger = () => {
  console.log('Manual trigger pressed');
  backgroundSyncService.performSyncTask("manual");
};
```

**Atau menggunakan BackgroundFetch langsung:**
```typescript
BackgroundFetch.scheduleTask({
  taskId: "com.transistorsoft.fetch",
  delay: 5000, // 5 detik
  forceAlarmManager: true,
  periodic: false,
});
```

### 7.3. Menangani Tugas

Method `performSyncTask` di `BackgroundSyncService` bertanggung jawab untuk menangani tugas latar belakang. Method ini dipanggil setiap kali peristiwa pengambilan latar belakang dipicu.

**Implementasi dengan Error Handling:**
```typescript
async performSyncTask(taskId: string): Promise<void> {
  console.log('[BackgroundFetch] taskId', taskId);

  try {
    const newPostTitle = `New Post ${new Date().toISOString()}`;
    await this.postRepository.createPost(newPostTitle);
    console.log('[BackgroundFetch] Sync completed successfully');
  } catch (error) {
    console.error('[BackgroundFetch] Sync failed:', error);
  } finally {
    BackgroundFetch.finish(taskId);
  }
}
```

**Keuntungan Implementasi Baru:**
- Proper error handling dengan try-catch-finally
- Dependency injection untuk repository
- Logging yang lebih informatif
- Separation of concerns yang jelas

## 8. Komponen UI dengan Feature-Based MVI Pattern

UI dibangun dengan feature-based MVI pattern yang fokus pada separation of concerns dan scalable component architecture.

### 8.1. Feature-Based App Structure dengan Navigation

Aplikasi utama sekarang mengimplementasikan simple navigation system antara HomeScreen dan BluetoothScreen:

```typescript
type Screen = 'home' | 'bluetooth';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigateToBluetooth={() => setCurrentScreen('bluetooth')} />;
      case 'bluetooth':
        return <BluetoothScreen onNavigateBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onNavigateToBluetooth={() => setCurrentScreen('bluetooth')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <ServiceProvider>
        {renderScreen()}
      </ServiceProvider>
    </SafeAreaProvider>
  );
};
```

### 8.2. HomeScreen Implementation dengan Bluetooth Integration

HomeScreen menggunakan useHomeViewModel untuk state management dan sekarang include Bluetooth printer card untuk navigation:

```typescript
export const HomeScreen = ({ onNavigateToBluetooth }: HomeScreenProps) => {
  const { state, actions } = useHomeViewModel();

  if (!state.isInitialized && !state.initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Initialization failed: {state.initializationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WorkManagerSample</Text>
        <View style={styles.headerButtons}>
          <Button 
            title={state.isPerformingSync ? "Syncing..." : "Manual Sync"} 
            onPress={actions.performManualSync}
            disabled={state.isPerformingSync}
          />
        </View>
      </View>

      {onNavigateToBluetooth && (
        <View style={styles.bluetoothSection}>
          <TouchableOpacity 
            style={styles.bluetoothCard} 
            onPress={onNavigateToBluetooth}
          >
            <View style={styles.bluetoothCardContent}>
              <Text style={styles.bluetoothCardTitle}>🖨️ Bluetooth Printer</Text>
              <Text style={styles.bluetoothCardSubtitle}>Connect and print to thermal printers</Text>
            </View>
            <Text style={styles.bluetoothCardArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.fcmSection}>
        <Text style={styles.sectionTitle}>FCM & Notifications</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission:</Text>
          <View style={[styles.statusBadge, { backgroundColor: state.permissionStatusColor }]}>
            <Text style={styles.statusText}>
              {state.permissionStatus ? state.permissionStatus.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.smallButton, state.isRequestingPermission && styles.disabledButton]} 
            onPress={actions.requestNotificationPermission}
            disabled={state.isRequestingPermission}
          >
            <Text style={styles.buttonText}>
              {state.isRequestingPermission ? 'Requesting...' : 'Request Permission'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.smallButton, state.isSendingTestNotification && styles.disabledButton]} 
            onPress={actions.sendTestNotification}
            disabled={state.isSendingTestNotification}
          >
            <Text style={styles.buttonText}>
              {state.isSendingTestNotification ? 'Sending...' : 'Test Notification'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={actions.showFCMToken}>
            <Text style={styles.buttonText}>Show Token</Text>
          </TouchableOpacity>
        </View>

        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{state.error}</Text>
            <TouchableOpacity onPress={actions.clearError} style={styles.errorCloseButton}>
              <Text style={styles.errorCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Posts and Logs sections */}
    </SafeAreaView>
  );
};
```

### 8.3. Firebase Module Initialization

Entry point aplikasi di `index.js` sekarang mengimport Firebase module untuk auto-initialization:

```javascript
import { AppRegistry } from 'react-native';
import '@react-native-firebase/app';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### 8.4. Enhanced Notification Service

NotificationService sekarang memiliki permission management yang lebih robust:

```typescript
export class NotificationService implements INotificationService {
  constructor() {
    this.initializePushNotification();
  }

  private initializePushNotification(): void {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('Push notification token registered:', token);
      },
      onNotification: function (notification) {
        console.log('Push notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true, // Auto-request permissions
    });

    this.createNotificationChannel('default', 'Default Channel');
  }

  async checkNotificationPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        PushNotification.checkPermissions((permissions) => {
          if (permissions && typeof permissions === 'object') {
            const hasPermissions = permissions.alert && permissions.badge && permissions.sound;
            resolve(hasPermissions);
          } else {
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Error checking permissions:', error);
        resolve(false);
      }
    });
  }

  async requestNotificationPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        PushNotification.requestPermissions((permissions) => {
          if (permissions && typeof permissions === 'object') {
            const hasPermissions = permissions.alert && permissions.badge && permissions.sound;
            resolve(hasPermissions);
          } else {
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Error requesting permissions:', error);
        resolve(false);
      }
    });
  }
}
```

### 8.5. Keuntungan Feature-Based MVI Architecture dengan Navigation

**Clean Separation of Concerns:**
- **Model**: HomeState dengan immutable state management per feature
- **View**: React components yang hanya consume state dan call actions
- **Intent**: User actions yang di-handle oleh feature-specific ViewModel methods
- **ViewModel**: Feature-specific business logic dan state management
- **Navigation**: App.tsx dengan simple state-based navigation system

**Enhanced User Experience:**
- Loading states untuk semua async operations (sync, permission, notification)
- Error states dengan error banner yang dapat di-dismiss
- Disabled states untuk buttons selama operations
- Real-time FCM message display dengan proper state management

**Developer Experience:**
- **Type Safety**: Strong TypeScript typing untuk state dan actions per feature
- **Predictable State**: Immutable state updates melalui reducer pattern
- **Easy Testing**: ViewModel class dapat di-unit test secara isolated per feature
- **Feature Isolation**: Setiap screen memiliki folder sendiri dengan ViewModel dan hooks
- **Self-contained**: Hook mengelola dependency injection secara internal
- **Scalable Structure**: Mudah menambah screen baru dengan pattern yang sama

**Maintainable Code:**
- **Single responsibility**: Feature-specific ViewModel untuk business logic, View untuk UI
- **Reusable patterns**: Consistent action-based state updates across features
- **Error handling**: Centralized error management dalam setiap ViewModel
- **Loading management**: Built-in loading states untuk semua operations per feature
- **Feature Expansion**: Easy untuk menambah bluetooth, camera, atau screen lainnya

## 9. Testing dan Maintainability

### 9.1. Unit Testing

Dengan arsitektur dependency injection, testing menjadi lebih mudah:

```typescript
// Mock repository untuk testing
const mockPostRepository: IPostRepository = {
  createPost: jest.fn(),
  getAllPosts: jest.fn(),
  deletePost: jest.fn(),
};

// Test service dengan mock dependency
const backgroundSyncService = new BackgroundSyncService(mockPostRepository);
```

### 9.2. Keuntungan Feature-Based MVI dengan Service Orchestration dan Navigation

**Maintainability:**
- **Feature-Based MVI**: Clear separation per feature dengan Model, View, dan Intent
- **Feature-Specific ViewModel**: Business logic terisolasi per screen/feature
- **Service Orchestration**: Specialized service classes dengan single responsibility
- **Interface Contracts**: Clear contracts untuk setiap service layer
- **Dependency Injection**: Internal DI dalam setiap ViewModel hook
- **Scalable Structure**: Easy expansion dengan consistent patterns

**Testability:**
- **Feature-Specific Testing**: Setiap ViewModel dapat di-test secara isolated per feature
- **Service Mocking**: Interface-based design memudahkan mocking
- **Isolated Testing**: Setiap layer dan feature dapat di-test secara terpisah
- **Action Testing**: Individual action methods dapat di-test independently per feature
- **State Testing**: Reducer logic dapat di-test dengan predictable inputs per feature

**Scalability:**
- **Feature-Based Scalability**: Pattern yang proven untuk multi-screen applications
- **Easy Feature Addition**: Tinggal tambah folder baru di `presentation/screen/`
- **ViewModel Extension**: Easy untuk menambah actions dan state properties per feature
- **Service Extension**: Service orchestrators dapat diperluas tanpa breaking changes
- **Modular Architecture**: Clear boundaries untuk feature expansion
- **Type Safety**: Strong typing mencegah runtime errors saat scaling
- **Navigation Ready**: Struktur siap untuk React Navigation implementation

**Developer Experience:**
- **Feature Organization**: Setiap feature memiliki folder sendiri dengan ViewModel, hooks, dan components
- **Self-contained Hook**: Dependency injection handled internally per feature
- **Type Safety**: Full TypeScript support dengan autocomplete per feature
- **Predictable State**: Immutable state updates dengan clear action flow per feature
- **Error Handling**: Built-in error states dan loading management per feature
- **Loading States**: Automatic loading indicators untuk async operations per feature
- **Simple Navigation**: State-based navigation system yang mudah dipahami dan di-extend

**Reliability:**
- **Immutable State**: Prevents accidental state mutations
- **Action-based Updates**: All state changes melalui well-defined actions
- **Error Boundaries**: Proper error handling di setiap layer
- **Loading Management**: Consistent loading states untuk better UX
- **Firebase Integration**: Proper initialization dan configuration validation
- **Permission Management**: Comprehensive permission handling dengan user feedback

## 10. Konfigurasi Firebase

Untuk menggunakan fitur FCM, Anda perlu mengkonfigurasi Firebase project:

### 10.1. Setup Firebase Project

1. **Buat Firebase Project:**
   - Kunjungi [Firebase Console](https://console.firebase.google.com/)
   - Buat project baru atau gunakan existing project
   - Enable Cloud Messaging di project settings

2. **Download Configuration Files:**
   - **Android:** Download `google-services.json` dan letakkan di `android/app/`
   - **iOS:** Download `GoogleService-Info.plist` dan letakkan di `ios/` folder

3. **Platform Configuration:**
   - **Android:** Tambahkan plugin di `android/build.gradle` dan `android/app/build.gradle`
   - **iOS:** Konfigurasi capabilities dan certificates untuk push notifications

### 10.2. Testing FCM

**Testing dengan Firebase Console:**
1. Buka Firebase Console → Cloud Messaging
2. Klik "Send your first message"
3. Masukkan notification title dan body
4. Pilih target (app atau specific token)
5. Send message dan cek di aplikasi

**Testing dengan FCM Token:**
1. Jalankan aplikasi dan klik "Show Token"
2. Copy FCM token yang ditampilkan
3. Gunakan token untuk testing server-side integration
4. Test dengan curl atau Postman ke FCM API

### 10.3. Dependencies Installation

Pastikan semua dependencies sudah terinstall:

```bash
yarn add @react-native-firebase/app @react-native-firebase/messaging @react-native-async-storage/async-storage react-native-push-notification react-native-thermal-printer react-native-vision-camera react-native-worklets-core
```

**Platform Linking (jika diperlukan):**
```bash
# iOS
cd ios && pod install

# Android - biasanya auto-link
npx react-native run-android
```

## 11. Menjalankan Proyek

Untuk menjalankan proyek, Anda dapat menggunakan perintah berikut:

**Untuk Android:**

```
yarn android
```

**Untuk iOS:**

```
yarn ios
```

## 12. Kesimpulan

Proyek ini memberikan dasar yang kuat untuk membangun aplikasi React Native dengan sinkronisasi data latar belakang, push notifications, dan **Bluetooth printer integration** menggunakan **Feature-Based MVI (Model-View-Intent) pattern**, clean architecture, dan service orchestration. Dengan menggunakan `react-native-background-fetch`, `WatermelonDB`, `Firebase Cloud Messaging`, `react-native-thermal-printer`, dan feature-specific ViewModel classes dengan specialized service orchestrators, kita dapat menciptakan aplikasi yang:

- **Feature-Based MVI Architecture:** Clean separation dengan Model-View-Intent pattern per feature
- **Feature-Specific ViewModels:** Isolated state management dengan class-based ViewModel per screen
- **Type-Safe:** Strong TypeScript typing untuk state, actions, dan services per feature
- **Maintainable:** Service orchestration dengan single responsibility principle
- **Testable:** Feature-specific ViewModel classes dan service classes yang mudah untuk unit testing
- **Highly Scalable:** Feature-based architecture dengan clear boundaries untuk expansion
- **Reliable:** Immutable state management dengan predictable action flow per feature
- **Developer-Friendly:** Feature isolation dan self-contained dependency injection
- **Navigation Implementation:** Simple state-based navigation system sudah terimplementasi dengan Bluetooth dan Camera screen
- **Real-time Communication:** FCM integration dengan automatic message handling
- **Offline-First:** Local storage dengan WatermelonDB dan AsyncStorage
- **Permission Management:** Comprehensive permission handling dengan user feedback
- **Notification Control:** Enhanced notification service dengan permission validation
- **Firebase Integration:** Proper Firebase initialization dan configuration validation
- **Bluetooth Printing:** Full thermal printer support dengan BLE connection dan mock development mode
- **Camera Barcode Scanning:** Real-time barcode detection dengan multiple format support dan scan history

### Fitur Lengkap yang Tersedia:

**Feature-Based MVI Pattern Implementation:**
- **HomeViewModel Class:** Feature-specific business logic management untuk Home screen
- **useHomeViewModel Hook:** React integration dengan internal dependency injection
- **Immutable State:** Type-safe state management dengan reducer pattern per feature
- **Action-based Updates:** All state changes melalui well-defined actions per feature
- **Loading States:** Built-in loading management untuk async operations per feature
- **Error Handling:** Centralized error management dengan user-friendly error states per feature
- **Backward Compatibility:** useAppViewModel redirect ke useHomeViewModel untuk smooth migration

**Service Orchestration:**
- AppInitializer untuk centralized service initialization
- FCMMessageHandler untuk automatic message processing
- NotificationManager untuk permission dan notification management
- FirebaseInitializer untuk proper Firebase setup validation

**Application Lifecycle Management:**
- useAppInitialization hook untuk application state management
- Loading dan error states yang built-in
- Automatic service cleanup dan listener management
- Centralized error handling dengan user feedback

**Enhanced UI/UX:**
- Loading indicators untuk semua async operations per feature
- Error banners yang dapat di-dismiss per feature
- Disabled states untuk buttons selama operations
- Real-time permission status dengan color coding
- FCM message display dengan proper state management
- Feature-specific UI components yang terisolasi
- **Bluetooth printer card** dengan prominent navigation dari HomeScreen
- **BluetoothScreen** dengan device scanning, connection management, dan printing capabilities
- **Camera barcode scanner card** dengan prominent navigation dari HomeScreen
- **CameraScreen** dengan real-time barcode detection, scan history, dan multiple format support

**Clean Architecture Benefits:**
- **Repository Pattern:** Data access abstraction dengan interface contracts
- **Service Layer:** Business logic separation dengan dependency injection
- **Feature-Based ViewModel Pattern:** Isolated state management dengan testable class methods per feature
- **Interface-based Design:** Maximum testability dengan easy mocking
- **Single Responsibility:** Each class dan service memiliki tanggung jawab yang jelas
- **Feature Isolation:** Clear boundaries antara features untuk better maintainability

**Developer Experience:**
- **Feature Organization:** Setiap feature memiliki folder sendiri dengan ViewModel, hooks, dan components
- **Self-contained:** Hook mengelola dependency injection secara internal per feature
- **Type Safety:** Full TypeScript support dengan compile-time error checking per feature
- **Predictable Patterns:** Consistent patterns untuk state updates dan service access across features
- **Easy Testing:** Class-based architecture memudahkan unit testing per feature
- **Easy Expansion:** Tinggal copy pattern dari HomeScreen untuk membuat screen baru
- **Navigation Ready:** Minimal App.tsx memudahkan implementasi React Navigation

Arsitektur ini mengikuti prinsip **SOLID**, **clean code**, dan **Feature-Based MVI pattern** dengan service orchestration, membuatnya ideal untuk proyek enterprise atau aplikasi yang akan berkembang dalam jangka panjang. Aplikasi memiliki state management yang predictable per feature, initialization yang robust, error handling yang comprehensive, dan notification system yang reliable dengan user experience yang optimal.

**Feature-Based MVI Pattern** memberikan struktur yang jelas untuk complex multi-screen applications, sementara **feature-specific ViewModel classes** menyediakan isolated business logic yang mudah untuk testing dan maintenance. Kombinasi ini menciptakan aplikasi yang highly scalable, maintainable, dan developer-friendly dengan clear path untuk expansion.

### Implemented Features

**Bluetooth Printer Integration:**
- ✅ **Device scanning** dengan mock support untuk development
- ✅ **Connection management** dengan proper error handling
- ✅ **Printing capabilities** untuk text, images, dan receipts
- ✅ **Navigation** dari HomeScreen dengan prominent Bluetooth card
- ✅ **Error handling** dan loading states untuk semua operations
- ✅ **Repository pattern** untuk device storage dan management
- ✅ **Use case layer** untuk business logic abstraction

**Camera Barcode Scanning Integration:**
- ✅ **Real-time barcode detection** dengan react-native-vision-camera
- ✅ **Multiple barcode formats** support (QR, EAN-13, Code-128, dll)
- ✅ **Camera permission management** dengan user-friendly flow
- ✅ **Scan history** dengan persistent storage menggunakan AsyncStorage
- ✅ **Navigation** dari HomeScreen dengan prominent Camera card
- ✅ **Error handling** dan loading states untuk semua operations
- ✅ **Repository pattern** untuk barcode data storage dan management
- ✅ **Use case layer** untuk camera business logic abstraction

**Navigation System:**
- ✅ **Simple state-based navigation** antara Home, Bluetooth, dan Camera screen
- ✅ **Back navigation** dengan proper state management
- ✅ **Easy upgrade path** untuk React Navigation jika diperlukan
- ✅ **Feature cards** di HomeScreen untuk navigasi ke berbagai fitur

### Migration Path untuk Screen Baru

Untuk menambah screen baru (misal: SettingsScreen), cukup:

1. **Buat folder baru:** `src/presentation/screen/settings/`
   - `SettingsScreen.tsx` - UI component
   - `SettingsViewModel.ts` - Business logic dan state management
   - `useSettingsViewModel.ts` - React hook integration

2. **Copy MVI pattern** dari CameraScreen atau BluetoothScreen

3. **Update App.tsx:** Tambah case baru di renderScreen() function

4. **Add navigation props** untuk HomeScreen dan tambah navigation card

Struktur ini memberikan foundation yang solid untuk aplikasi React Native enterprise dengan excellent developer experience dan maintainability jangka panjang.
