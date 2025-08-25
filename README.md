# WorkManager alternative dengan React Native

Project ini memberikan penjelasan rinci tentang proyek yang telah kita bangun, dengan fokus pada cara mengimplementasikan tugas latar belakang di aplikasi React Native menggunakan `react-native-background-fetch` dan `WatermelonDB`.

## 1. Ikhtisar Proyek

Tujuan dari proyek ini adalah untuk menunjukkan cara melakukan sinkronisasi data latar belakang di aplikasi React Native. Kami telah membuat aplikasi sederhana yang menyimulasikan proses sinkronisasi batch, di mana data diambil dari basis data lokal dan ditampilkan di UI. Tugas latar belakang dijadwalkan untuk berjalan secara berkala, bahkan saat aplikasi berada di latar belakang atau dihentikan.

### Teknologi yang Digunakan

*   **React Native:** Kerangka kerja untuk membangun aplikasi asli menggunakan React.
*   **`react-native-background-fetch`:** Pustaka untuk menjadwalkan tugas latar belakang di Android dan iOS.
*   **`WatermelonDB`:** Kerangka kerja basis data reaktif berkinerja tinggi untuk React Native.
*   **TypeScript:** Superset JavaScript yang diketik.

## 2. Struktur Proyek

Struktur proyek adalah sebagai berikut:

```
.
├── android
├── ios
├── src
│   ├── db
│   │   ├── index.ts
│   │   ├── Post.ts
│   │   └── schema.ts
│   └── services
│       └── BackgroundSync.ts
├── App.tsx
└── ...
```

*   **`android` & `ios`:** Folder proyek asli untuk Android dan iOS.
*   **`src`:** Berisi kode sumber aplikasi.
    *   **`db`:** Berisi penyiapan WatermelonDB, termasuk skema, model, dan instance basis data.
    *   **`services`:** Berisi layanan sinkronisasi latar belakang.
*   **`App.tsx`:** Komponen aplikasi utama.

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

## 4. Tugas Latar Belakang dengan `react-native-background-fetch`

Kami menggunakan `react-native-background-fetch` untuk menjadwalkan dan menjalankan tugas latar belakang.

### Konfigurasi

Pustaka dikonfigurasi di `src/services/BackgroundSync.ts`. Fungsi `configure` mengambil parameter berikut:

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

### Menjadwalkan Tugas

Kita dapat menjadwalkan tugas satu kali menggunakan fungsi `scheduleTask`. Ini berguna untuk memicu tugas secara manual, misalnya, saat pengguna menekan tombol.

```typescript
BackgroundFetch.scheduleTask({
  taskId: "com.transistorsoft.fetch",
  delay: 5000, // 5 detik
  forceAlarmManager: true,
  periodic: false,
});
```

### Menangani Tugas

Fungsi `syncTask` di `src/services/BackgroundSync.ts` bertanggung jawab untuk menangani tugas latar belakang. Fungsi ini dipanggil setiap kali peristiwa pengambilan latar belakang dipicu.

Dalam kasus kami, fungsi `syncTask` membuat posting baru di basis data dengan stempel waktu saat ini.

## 5. Komponen UI

UI dibangun dengan komponen React Native standar.

### Menampilkan Data

Kami menggunakan komponen tingkat tinggi `@nozbe/with-observables` untuk menghubungkan komponen `PostsList` ke basis data WatermelonDB. Ini memungkinkan komponen untuk mengamati koleksi `posts` dan secara otomatis dirender ulang saat data berubah.

### Pemicu Manual

Tombol "Sinkronisasi Manual" di `App.tsx` memicu fungsi `manualTrigger`, yang menjadwalkan tugas latar belakang satu kali menggunakan `scheduleTask`.

## 6. Menjalankan Proyek

Untuk menjalankan proyek, Anda dapat menggunakan perintah berikut:

**Untuk Android:**

```
yarn android
```

**Untuk iOS:**

```
yarn ios
```

## 7. Kesimpulan

Proyek ini memberikan dasar yang kuat untuk membangun aplikasi React Native dengan sinkronisasi data latar belakang. Dengan menggunakan `react-native-background-fetch` dan `WatermelonDB`, kita dapat menciptakan pengalaman pengguna yang mulus di mana data selalu terbaru, bahkan saat aplikasi tidak berjalan.
