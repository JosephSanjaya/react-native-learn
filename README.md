# WorkManager alternative dengan React Native

Project ini memberikan penjelasan rinci tentang proyek yang telah kita bangun, dengan fokus pada cara mengimplementasikan tugas latar belakang di aplikasi React Native menggunakan `react-native-background-fetch` dan `WatermelonDB`.

## 1. Ikhtisar Proyek

Tujuan dari proyek ini adalah untuk menunjukkan cara melakukan sinkronisasi data latar belakang di aplikasi React Native. Kami telah membuat aplikasi sederhana yang menyimulasikan proses sinkronisasi batch, di mana data diambil dari basis data lokal dan ditampilkan di UI. Tugas latar belakang dijadwalkan untuk berjalan secara berkala, bahkan saat aplikasi berada di latar belakang atau dihentikan.

### Teknologi yang Digunakan

*   **React Native:** Kerangka kerja untuk membangun aplikasi asli menggunakan React.
*   **`react-native-background-fetch`:** Pustaka untuk menjadwalkan tugas latar belakang di Android dan iOS.
*   **`WatermelonDB`:** Kerangka kerja basis data reaktif berkinerja tinggi untuk React Native.
*   **TypeScript:** Superset JavaScript yang diketik.
*   **React Context API:** Untuk dependency injection dan state management.
*   **Repository Pattern:** Untuk abstraksi layer data dan pemisahan concerns.

## 2. Struktur Proyek

Struktur proyek telah direfactor menggunakan clean architecture dengan dependency injection:

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
│   │   └── usePostRepository.ts
│   ├── repositories
│   │   ├── interfaces
│   │   │   └── IPostRepository.ts
│   │   └── PostRepository.ts
│   └── services
│       ├── interfaces
│       │   └── IBackgroundSyncService.ts
│       ├── BackgroundSync.ts
│       └── BackgroundSyncFactory.ts
├── App.tsx
└── ...
```

*   **`android` & `ios`:** Folder proyek asli untuk Android dan iOS.
*   **`src`:** Berisi kode sumber aplikasi dengan arsitektur yang terstruktur.
    *   **`context`:** Berisi React Context untuk dependency injection.
    *   **`db`:** Berisi penyiapan WatermelonDB, termasuk skema, model, dan instance basis data.
    *   **`hooks`:** Custom React hooks untuk mengakses services dengan mudah.
    *   **`repositories`:** Layer abstraksi untuk operasi database dengan interface contracts.
    *   **`services`:** Business logic layer dengan interface-based architecture.
*   **`App.tsx`:** Komponen aplikasi utama yang menggunakan ServiceProvider.

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

## 4. Arsitektur Clean Code dengan Dependency Injection

Proyek ini telah direfactor menggunakan prinsip-prinsip clean architecture dan dependency injection untuk meningkatkan maintainability, testability, dan scalability.

### 4.1. Dependency Injection dengan React Context

Kami menggunakan React Context API untuk implementasi dependency injection yang native dan lightweight:

#### ServiceContext (`src/context/ServiceContext.tsx`)

```typescript
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const postRepository = new PostRepository();
  const backgroundSyncService = new BackgroundSyncService(postRepository);

  const services: ServiceContextType = {
    postRepository,
    backgroundSyncService,
  };

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};
```

**Keuntungan:**
- Tidak memerlukan library eksternal seperti Inversify
- Menggunakan pola React yang sudah familiar
- Mudah untuk testing dengan mock services
- Lifecycle management otomatis oleh React

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

### 4.4. Custom React Hooks

Custom hooks menyediakan interface yang clean untuk mengakses services:

#### useBackgroundSync Hook (`src/hooks/useBackgroundSync.ts`)

```typescript
export const useBackgroundSync = () => {
  const { backgroundSyncService } = useServices();
  return backgroundSyncService;
};
```

#### usePostRepository Hook (`src/hooks/usePostRepository.ts`)

```typescript
export const usePostRepository = () => {
  const { postRepository } = useServices();
  return postRepository;
};
```

**Keuntungan:**
- API yang descriptive dan mudah digunakan
- Abstraksi dari internal service structure
- Konsisten dengan React patterns
- IDE autocomplete yang lebih baik

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

## 5. Tugas Latar Belakang dengan `react-native-background-fetch`

Kami menggunakan `react-native-background-fetch` untuk menjadwalkan dan menjalankan tugas latar belakang.

### 5.1. Konfigurasi

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

### 5.2. Menjadwalkan Tugas

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

### 5.3. Menangani Tugas

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

## 6. Komponen UI dengan Dependency Injection

UI dibangun dengan komponen React Native standar.

### 6.1. Struktur Komponen dengan ServiceProvider

Aplikasi sekarang menggunakan provider pattern untuk dependency injection:

```typescript
const App = () => {
  return (
    <ServiceProvider>
      <AppContent />
    </ServiceProvider>
  );
};
```

### 6.2. Menampilkan Data

Kami tetap menggunakan komponen tingkat tinggi `@nozbe/with-observables` untuk menghubungkan komponen `PostsList` ke basis data WatermelonDB. Ini memungkinkan komponen untuk mengamati koleksi `posts` dan secara otomatis dirender ulang saat data berubah.

### 6.3. Penggunaan Services dalam Komponen

Komponen `AppContent` menggunakan custom hook untuk mengakses services:

```typescript
const AppContent = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const backgroundSyncService = useBackgroundSync();

  useEffect(() => {
    const initializeBackgroundSync = async () => {
      try {
        await backgroundSyncService.configureBackgroundFetch();
      } catch (error) {
        console.error('Failed to configure background sync:', error);
      }
    };

    initializeBackgroundSync();
  }, [backgroundSyncService]);

  const manualTrigger = () => {
    console.log('Manual trigger pressed');
    backgroundSyncService.performSyncTask("manual");
  };
  // ... rest of component
};
```

### 6.4. Pemicu Manual

Tombol "Sinkronisasi Manual" di `App.tsx` sekarang memicu method `performSyncTask` langsung melalui service, memberikan kontrol yang lebih baik dan error handling yang proper.

## 7. Testing dan Maintainability

### 7.1. Unit Testing

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

### 7.2. Keuntungan Arsitektur Baru

**Maintainability:**
- Kode terstruktur dengan separation of concerns
- Interface contracts yang jelas
- Dependency injection memudahkan perubahan implementasi

**Testability:**
- Easy mocking dengan interface-based design
- Isolated unit testing untuk setiap layer
- Dependency injection memungkinkan test doubles

**Scalability:**
- Mudah menambah repository atau service baru
- Pattern yang konsisten untuk semua features
- Loose coupling antar components

**Developer Experience:**
- Custom hooks yang descriptive
- IDE autocomplete yang lebih baik
- Error handling yang proper di setiap layer

## 8. Menjalankan Proyek

Untuk menjalankan proyek, Anda dapat menggunakan perintah berikut:

**Untuk Android:**

```
yarn android
```

**Untuk iOS:**

```
yarn ios
```

## 9. Kesimpulan

Proyek ini memberikan dasar yang kuat untuk membangun aplikasi React Native dengan sinkronisasi data latar belakang menggunakan clean architecture. Dengan menggunakan `react-native-background-fetch`, `WatermelonDB`, dan dependency injection pattern, kita dapat menciptakan aplikasi yang:

- **Maintainable:** Kode terstruktur dengan separation of concerns yang jelas
- **Testable:** Easy mocking dan isolated testing untuk setiap layer
- **Scalable:** Pattern yang konsisten untuk menambah features baru
- **Reliable:** Error handling yang proper dan logging yang informatif
- **Developer-Friendly:** Custom hooks dan interface yang descriptive

Arsitektur ini mengikuti prinsip SOLID dan clean code, membuatnya ideal untuk proyek enterprise atau aplikasi yang akan berkembang dalam jangka panjang. Data selalu terbaru bahkan saat aplikasi tidak berjalan, dengan kode yang mudah dipahami dan dimodifikasi.
