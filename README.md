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

## 5. Arsitektur MVI (Model-View-Intent) dengan Clean Code

Proyek ini telah direfactor menggunakan pola MVI (Model-View-Intent) dengan clean architecture, dependency injection, dan service orchestration untuk meningkatkan maintainability, testability, dan scalability. Aplikasi sekarang menggunakan ViewModel class untuk mengelola state management dan business logic, serta specialized service classes untuk mengelola initialization, message handling, dan notification management.

### 5.1. MVI Pattern Implementation

Aplikasi menggunakan pola MVI (Model-View-Intent) dengan ViewModel class yang mengelola state dan business logic:

#### AppViewModel Class (`AppViewModel.ts`)

ViewModel class yang co-located dengan App.tsx untuk visibility yang lebih baik:

```typescript
export class AppViewModel {
  private services: any;
  private backgroundSyncService: any;
  private appInitialization: any;
  private consoleLogger: any;
  private dispatch: (action: AppAction) => void;

  constructor(
    services: any,
    backgroundSyncService: any,
    appInitialization: any,
    consoleLogger: any,
    dispatch: (action: AppAction) => void
  ) {
    this.services = services;
    this.backgroundSyncService = backgroundSyncService;
    this.appInitialization = appInitialization;
    this.consoleLogger = consoleLogger;
    this.dispatch = dispatch;
  }

  getInitialState(): AppState {
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

  reducer(state: AppState, action: AppAction): AppState {
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

#### useAppViewModel Hook (`src/hooks/useAppViewModel.ts`)

React hook yang menggunakan ViewModel class dengan dependency injection internal:

```typescript
export function useAppViewModel() {
  const services = useServices();
  const backgroundSyncService = useBackgroundSync();
  const appInitialization = useAppInitialization();
  const consoleLogger = useConsoleLogger();

  const viewModel = useMemo(() => {
    return new AppViewModel(
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

**ViewModel Advantages:**
- **Co-location**: ViewModel class berada di samping App.tsx untuk visibility
- **Self-contained**: Dependency injection handled internally dalam hook
- **Type Safety**: Strong typing untuk state dan actions
- **Testability**: ViewModel class mudah untuk unit testing
- **Maintainability**: Business logic terpusat dalam class methods

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

### 5.3. Repository Pattern

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

## 7. Komponen UI dengan MVI Pattern

UI dibangun dengan pola MVI yang fokus pada separation of concerns dan clean component architecture.

### 7.1. MVI App Component Implementation

Aplikasi utama sekarang menggunakan ViewModel untuk state management:

```typescript
const App = () => {
  return (
    <SafeAreaProvider>
      <ServiceProvider>
        <AppContent />
      </ServiceProvider>
    </SafeAreaProvider>
  );
};

const AppContent = () => {
  const { state, actions } = useAppViewModel();

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
        <Button 
          title={state.isPerformingSync ? "Syncing..." : "Manual Sync"} 
          onPress={actions.performManualSync}
          disabled={state.isPerformingSync}
        />
      </View>

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

### 7.4. Keuntungan MVI Architecture

**Clean Separation of Concerns:**
- **Model**: AppState dengan immutable state management
- **View**: React components yang hanya consume state dan call actions
- **Intent**: User actions yang di-handle oleh ViewModel methods
- **ViewModel**: Centralized business logic dan state management

**Enhanced User Experience:**
- Loading states untuk semua async operations (sync, permission, notification)
- Error states dengan error banner yang dapat di-dismiss
- Disabled states untuk buttons selama operations
- Real-time FCM message display dengan proper state management

**Developer Experience:**
- **Type Safety**: Strong TypeScript typing untuk state dan actions
- **Predictable State**: Immutable state updates melalui reducer pattern
- **Easy Testing**: ViewModel class dapat di-unit test secara isolated
- **Co-location**: ViewModel class berada di samping App component
- **Self-contained**: Hook mengelola dependency injection secara internal

**Maintainable Code:**
- Single responsibility: ViewModel untuk business logic, View untuk UI
- Reusable patterns: Consistent action-based state updates
- Error handling: Centralized error management dalam ViewModel
- Loading management: Built-in loading states untuk semua operations

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

### 8.2. Keuntungan MVI dengan Service Orchestration

**Maintainability:**
- **MVI Pattern**: Clear separation antara Model, View, dan Intent
- **ViewModel Class**: Centralized business logic dengan method-based actions
- **Service Orchestration**: Specialized service classes dengan single responsibility
- **Interface Contracts**: Clear contracts untuk setiap service layer
- **Dependency Injection**: Internal DI dalam ViewModel hook

**Testability:**
- **ViewModel Testing**: Class-based ViewModel mudah untuk unit testing
- **Service Mocking**: Interface-based design memudahkan mocking
- **Isolated Testing**: Setiap layer dapat di-test secara terpisah
- **Action Testing**: Individual action methods dapat di-test independently
- **State Testing**: Reducer logic dapat di-test dengan predictable inputs

**Scalability:**
- **MVI Scalability**: Pattern yang proven untuk complex state management
- **ViewModel Extension**: Easy untuk menambah actions dan state properties
- **Service Extension**: Service orchestrators dapat diperluas tanpa breaking changes
- **Modular Architecture**: Clear boundaries untuk feature expansion
- **Type Safety**: Strong typing mencegah runtime errors saat scaling

**Developer Experience:**
- **Co-located ViewModel**: ViewModel class visible di samping App component
- **Self-contained Hook**: Dependency injection handled internally
- **Type Safety**: Full TypeScript support dengan autocomplete
- **Predictable State**: Immutable state updates dengan clear action flow
- **Error Handling**: Built-in error states dan loading management
- **Loading States**: Automatic loading indicators untuk async operations

**Reliability:**
- **Immutable State**: Prevents accidental state mutations
- **Action-based Updates**: All state changes melalui well-defined actions
- **Error Boundaries**: Proper error handling di setiap layer
- **Loading Management**: Consistent loading states untuk better UX
- **Firebase Integration**: Proper initialization dan configuration validation
- **Permission Management**: Comprehensive permission handling dengan user feedback

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

Proyek ini memberikan dasar yang kuat untuk membangun aplikasi React Native dengan sinkronisasi data latar belakang dan push notifications menggunakan **MVI (Model-View-Intent) pattern**, clean architecture, dan service orchestration. Dengan menggunakan `react-native-background-fetch`, `WatermelonDB`, `Firebase Cloud Messaging`, dan ViewModel class dengan specialized service orchestrators, kita dapat menciptakan aplikasi yang:

- **MVI Architecture:** Clean separation dengan Model-View-Intent pattern
- **ViewModel-Driven:** Centralized state management dengan class-based ViewModel
- **Type-Safe:** Strong TypeScript typing untuk state, actions, dan services
- **Maintainable:** Service orchestration dengan single responsibility principle
- **Testable:** ViewModel class dan service classes yang mudah untuk unit testing
- **Scalable:** Modular architecture dengan clear boundaries untuk expansion
- **Reliable:** Immutable state management dengan predictable action flow
- **Developer-Friendly:** Co-located ViewModel dan self-contained dependency injection
- **Real-time Communication:** FCM integration dengan automatic message handling
- **Offline-First:** Local storage dengan WatermelonDB dan AsyncStorage
- **Permission Management:** Comprehensive permission handling dengan user feedback
- **Notification Control:** Enhanced notification service dengan permission validation
- **Firebase Integration:** Proper Firebase initialization dan configuration validation

### Fitur Lengkap yang Tersedia:

**MVI Pattern Implementation:**
- **AppViewModel Class:** Co-located dengan App.tsx untuk business logic management
- **useAppViewModel Hook:** React integration dengan internal dependency injection
- **Immutable State:** Type-safe state management dengan reducer pattern
- **Action-based Updates:** All state changes melalui well-defined actions
- **Loading States:** Built-in loading management untuk async operations
- **Error Handling:** Centralized error management dengan user-friendly error states

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
- Loading indicators untuk semua async operations
- Error banners yang dapat di-dismiss
- Disabled states untuk buttons selama operations
- Real-time permission status dengan color coding
- FCM message display dengan proper state management

**Clean Architecture Benefits:**
- **Repository Pattern:** Data access abstraction dengan interface contracts
- **Service Layer:** Business logic separation dengan dependency injection
- **ViewModel Pattern:** Centralized state management dengan testable class methods
- **Interface-based Design:** Maximum testability dengan easy mocking
- **Single Responsibility:** Each class dan service memiliki tanggung jawab yang jelas

**Developer Experience:**
- **Co-location:** ViewModel class berada di samping App component untuk visibility
- **Self-contained:** Hook mengelola dependency injection secara internal
- **Type Safety:** Full TypeScript support dengan compile-time error checking
- **Predictable Patterns:** Consistent patterns untuk state updates dan service access
- **Easy Testing:** Class-based architecture memudahkan unit testing

Arsitektur ini mengikuti prinsip **SOLID**, **clean code**, dan **MVI pattern** dengan service orchestration, membuatnya ideal untuk proyek enterprise atau aplikasi yang akan berkembang dalam jangka panjang. Aplikasi memiliki state management yang predictable, initialization yang robust, error handling yang comprehensive, dan notification system yang reliable dengan user experience yang optimal.

**MVI Pattern** memberikan struktur yang jelas untuk complex state management, sementara **ViewModel class** menyediakan centralized business logic yang mudah untuk testing dan maintenance. Kombinasi ini menciptakan aplikasi yang scalable, maintainable, dan developer-friendly.
