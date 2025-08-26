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
*   **TypeScript:** Superset JavaScript yang diketik.
*   **React Context API:** Untuk dependency injection dan state management.
*   **Repository Pattern:** Untuk abstraksi layer data dan pemisahan concerns.

## 2. Struktur Proyek

Struktur proyek telah direfactor menggunakan clean architecture dengan dependency injection dan service orchestration:

```
.
├── android
├── ios
├── src
│   ├── context
│   │   └── ServiceContext.tsx
│   ├── db
│   │   ├── index.ts
│   │   ├── Post.ts
│   │   └── schema.ts
│   ├── hooks
│   │   ├── useBackgroundSync.ts
│   │   ├── usePostRepository.ts
│   │   ├── usePermission.ts
│   │   ├── useNotification.ts
│   │   ├── useFCM.ts
│   │   ├── useFCMToken.ts
│   │   ├── useAppInitialization.ts
│   │   └── useConsoleLogger.ts
│   ├── repositories
│   │   ├── interfaces
│   │   │   ├── IPostRepository.ts
│   │   │   └── IFCMTokenRepository.ts
│   │   ├── PostRepository.ts
│   │   └── FCMTokenRepository.ts
│   └── services
│       ├── interfaces
│       │   ├── IBackgroundSyncService.ts
│       │   ├── IPermissionService.ts
│       │   ├── INotificationService.ts
│       │   └── IFCMService.ts
│       ├── AppInitializer.ts
│       ├── FirebaseInitializer.ts
│       ├── FCMMessageHandler.ts
│       ├── NotificationManager.ts
│       ├── BackgroundSync.ts
│       ├── BackgroundSyncFactory.ts
│       ├── PermissionService.ts
│       ├── NotificationService.ts
│       └── FCMService.ts
├── App.tsx
├── index.js
└── ...
```

*   **`android` & `ios`:** Folder proyek asli untuk Android dan iOS.
*   **`src`:** Berisi kode sumber aplikasi dengan arsitektur yang terstruktur.
    *   **`context`:** Berisi React Context untuk dependency injection dan service orchestration.
    *   **`db`:** Berisi penyiapan WatermelonDB, termasuk skema, model, dan instance basis data.
    *   **`hooks`:** Custom React hooks untuk mengakses services dan application lifecycle management.
    *   **`repositories`:** Layer abstraksi untuk operasi database dan penyimpanan lokal dengan interface contracts.
    *   **`services`:** Business logic layer dengan service orchestrators, initializers, dan specialized handlers.
*   **`App.tsx`:** Komponen aplikasi utama yang fokus pada UI rendering dan user interactions.
*   **`index.js`:** Entry point aplikasi dengan Firebase module initialization.

## 3. Basis Data Lokal dengan WatermelonDB

Kami menggunakan WatermelonDB untuk menyimpan data secara lokal. Ini adalah basis data reaktif, yang berarti UI akan diperbarui secara otomatis saat data berubah.

### Skema

Skema basis data didefinisikan dalam `src/db/schema.ts`. Kami memiliki satu tabel bernama `posts` dengan kolom berikut:

*   `title`: Judul posting (string).
*   `body`: Isi posting (string, opsional).
*   `created_at`: Stempel waktu pembuatan (angka).
*   `updated_at`: Stempel waktu pembaruan (angka).

### Model

Model `Post` didefinisikan dalam `src/db/Post.ts`. Ini mewakili satu posting di basis data dan menyediakan metode untuk mengakses dan memodifikasi data.

### Instance Basis Data

Instance basis data dibuat di `src/db/index.ts`. Ini menggunakan `SQLiteAdapter` untuk terhubung ke basis data SQLite di perangkat.

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

**Implementasi (`src/repositories/FCMTokenRepository.ts`):**
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

FCM terintegrasi langsung dalam `App.tsx` dengan UI yang bersih:

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

## 5. Arsitektur Clean Code dengan Service Orchestration

Proyek ini telah direfactor menggunakan prinsip-prinsip clean architecture, dependency injection, dan service orchestration untuk meningkatkan maintainability, testability, dan scalability. Aplikasi sekarang menggunakan specialized service classes untuk mengelola initialization, message handling, dan notification management.

### 5.1. Service Orchestration dengan Specialized Classes

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

#### ServiceContext dengan Service Orchestration (`src/context/ServiceContext.tsx`)

```typescript
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const postRepository = new PostRepository();
  const fcmTokenRepository = new FCMTokenRepository();
  const backgroundSyncService = new BackgroundSyncService(postRepository);
  const permissionService = new PermissionService();
  const notificationService = new NotificationService();
  const fcmService = new FCMService(fcmTokenRepository);
  
  // Service Orchestrators
  const appInitializer = new AppInitializer(fcmService, permissionService, backgroundSyncService);
  const fcmMessageHandler = new FCMMessageHandler(fcmService, notificationService);
  const notificationManager = new NotificationManager(notificationService, permissionService);

  const services: ServiceContextType = {
    postRepository,
    fcmTokenRepository,
    backgroundSyncService,
    permissionService,
    notificationService,
    fcmService,
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

### 4.2. Repository Pattern

Repository pattern memisahkan logic akses data dari business logic:

#### IPostRepository Interface (`src/repositories/interfaces/IPostRepository.ts`)

```typescript
export interface IPostRepository {
  createPost(title: string): Promise<void>;
  getAllPosts(): Promise<any[]>;
  deletePost(id: string): Promise<void>;
}
```

#### PostRepository Implementation (`src/repositories/PostRepository.ts`)

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

### 4.3. Service Layer Architecture

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

### 5.4. Application Lifecycle Hooks

Custom hooks untuk mengelola application lifecycle dan initialization:

#### useAppInitialization Hook (`src/hooks/useAppInitialization.ts`)

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

#### useConsoleLogger Hook (`src/hooks/useConsoleLogger.ts`)

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

### 4.5. Factory Pattern

Factory pattern untuk manual service creation jika diperlukan:

```typescript
export class BackgroundSyncFactory {
  static createBackgroundSyncService(): IBackgroundSyncService {
    const postRepository = new PostRepository();
    return new BackgroundSyncService(postRepository);
  }
}
```

## 6. Tugas Latar Belakang dengan `react-native-background-fetch`

Kami menggunakan `react-native-background-fetch` untuk menjadwalkan dan menjalankan tugas latar belakang.

### 6.1. Konfigurasi

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

### 6.2. Menjadwalkan Tugas

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

### 6.3. Menangani Tugas

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

## 7. Komponen UI dengan Clean Architecture

UI dibangun dengan fokus pada separation of concerns dan clean component architecture.

### 7.1. Simplified App Component

Aplikasi utama sekarang fokus hanya pada UI rendering dan user interactions:

```typescript
const App = () => {
  return (
    <ServiceProvider>
      <AppContent />
    </ServiceProvider>
  );
};

const AppContent = () => {
  const services = useServices();
  const backgroundSyncService = useBackgroundSync();
  const { logs } = useConsoleLogger();
  
  const {
    isInitialized,
    initializationError,
    fcmToken,
    permissionStatus,
    receivedMessages,
    setPermissionStatus
  } = useAppInitialization();

  const manualTrigger = () => {
    console.log('Manual trigger pressed');
    backgroundSyncService.performSyncTask("manual");
  };

  const requestNotificationPermission = async () => {
    try {
      const status = await services.notificationManager.requestPermissionWithFeedback();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      await services.notificationManager.sendTestNotification();
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  if (!isInitialized && !initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Initialization failed: {initializationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ... rest of UI rendering
};
```

### 7.2. Firebase Module Initialization

Entry point aplikasi di `index.js` sekarang mengimport Firebase module untuk auto-initialization:

```javascript
import { AppRegistry } from 'react-native';
import '@react-native-firebase/app';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### 7.3. Enhanced Notification Service

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

### 7.4. Keuntungan UI Architecture Baru

**Simplified Components:**
- App.tsx fokus hanya pada UI rendering
- Logic initialization dipindah ke specialized hooks
- Error handling dan loading states yang proper

**Better User Experience:**
- Loading states selama initialization
- Error states dengan pesan yang informatif
- Permission management dengan user feedback
- Real-time FCM message display

**Maintainable Code:**
- Single responsibility untuk setiap component
- Reusable hooks untuk common functionality
- Consistent error handling patterns
- Clean separation antara UI dan business logic

## 8. Testing dan Maintainability

### 8.1. Unit Testing

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

### 8.2. Keuntungan Arsitektur Service Orchestration

**Maintainability:**
- Specialized service classes dengan single responsibility
- Clear separation antara initialization, message handling, dan notification management
- Interface contracts yang jelas untuk setiap service
- Dependency injection memudahkan perubahan implementasi

**Testability:**
- Easy mocking dengan interface-based design
- Isolated unit testing untuk setiap service orchestrator
- Dependency injection memungkinkan test doubles
- Specialized classes mudah untuk unit testing

**Scalability:**
- Service orchestrators dapat diperluas tanpa mengubah core services
- Pattern yang konsisten untuk menambah service baru
- Loose coupling antar service orchestrators
- Modular architecture untuk feature expansion

**Developer Experience:**
- Application lifecycle hooks yang descriptive
- Centralized initialization dengan proper error handling
- IDE autocomplete yang lebih baik
- Loading dan error states yang built-in
- Consistent patterns untuk service access

**Reliability:**
- Proper initialization order dengan AppInitializer
- Centralized error handling di setiap orchestrator
- Firebase initialization validation
- Permission management dengan user feedback
- Automatic cleanup untuk message listeners

## 9. Konfigurasi Firebase

Untuk menggunakan fitur FCM, Anda perlu mengkonfigurasi Firebase project:

### 9.1. Setup Firebase Project

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

### 9.2. Testing FCM

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

### 9.3. Dependencies Installation

Pastikan semua dependencies FCM sudah terinstall:

```bash
yarn add @react-native-firebase/app @react-native-firebase/messaging @react-native-async-storage/async-storage react-native-push-notification
```

**Platform Linking (jika diperlukan):**
```bash
# iOS
cd ios && pod install

# Android - biasanya auto-link
npx react-native run-android
```

## 10. Menjalankan Proyek

Untuk menjalankan proyek, Anda dapat menggunakan perintah berikut:

**Untuk Android:**

```
yarn android
```

**Untuk iOS:**

```
yarn ios
```

## 11. Kesimpulan

Proyek ini memberikan dasar yang kuat untuk membangun aplikasi React Native dengan sinkronisasi data latar belakang dan push notifications menggunakan clean architecture dan service orchestration. Dengan menggunakan `react-native-background-fetch`, `WatermelonDB`, `Firebase Cloud Messaging`, dan specialized service orchestrators, kita dapat menciptakan aplikasi yang:

- **Maintainable:** Service orchestration dengan single responsibility principle
- **Testable:** Specialized service classes yang mudah untuk unit testing
- **Scalable:** Modular architecture dengan service orchestrators yang dapat diperluas
- **Reliable:** Centralized initialization dan error handling yang robust
- **Developer-Friendly:** Application lifecycle hooks dan loading states yang built-in
- **Real-time Communication:** FCM integration dengan automatic message handling
- **Offline-First:** Local storage dengan WatermelonDB dan AsyncStorage
- **Permission Management:** Comprehensive permission handling dengan user feedback
- **Notification Control:** Enhanced notification service dengan permission validation
- **Firebase Integration:** Proper Firebase initialization dan configuration validation

### Fitur Lengkap yang Tersedia:

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

**Enhanced Notification System:**
- Permission validation sebelum sending notifications
- Automatic permission request dengan user feedback
- Enhanced notification properties untuk better visibility
- Duplicate notification prevention
- Test notification dengan comprehensive logging

**Firebase Integration:**
- Proper Firebase module initialization di entry point
- FCM token management dengan automatic refresh
- Background message processing
- Firebase configuration validation

**Clean Architecture:**
- Repository pattern untuk data access
- Specialized service orchestrators untuk complex operations
- Dependency injection dengan React Context
- Interface-based design untuk maximum testability
- Single responsibility principle di setiap service class

Arsitektur ini mengikuti prinsip SOLID dan clean code dengan service orchestration pattern, membuatnya ideal untuk proyek enterprise atau aplikasi yang akan berkembang dalam jangka panjang. Aplikasi memiliki initialization yang robust, error handling yang comprehensive, dan notification system yang reliable dengan user experience yang optimal.
