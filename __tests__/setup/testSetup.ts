// Mock react-native modules
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  FlatList: 'FlatList',
  ScrollView: 'ScrollView',
  Button: 'Button',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-background-fetch
jest.mock('react-native-background-fetch', () => ({
  configure: jest.fn(() => Promise.resolve(0)),
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  finish: jest.fn(),
  status: jest.fn(() => Promise.resolve(0)),
  scheduleTask: jest.fn(() => Promise.resolve()),
  FETCH_RESULT_NEW_DATA: 0,
  FETCH_RESULT_NO_DATA: 1,
  FETCH_RESULT_FAILED: 2,
  NETWORK_TYPE_NONE: 0,
  NETWORK_TYPE_ANY: 1,
  NETWORK_TYPE_UNMETERED: 2,
}));

// Mock Firebase modules
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    apps: [],
    app: jest.fn(() => ({
      delete: jest.fn(() => Promise.resolve()),
    })),
  })),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    onMessage: jest.fn(() => jest.fn()),
    onTokenRefresh: jest.fn(() => jest.fn()),
    subscribeToTopic: jest.fn(() => Promise.resolve()),
    unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
    setBackgroundMessageHandler: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    hasPermission: jest.fn(() => Promise.resolve(1)),
  })),
}));

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  checkPermissions: jest.fn((callback) => callback({ alert: true, badge: true, sound: true })),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  createChannel: jest.fn(),
  channelExists: jest.fn((channelId, callback) => callback(true)),
  channelBlocked: jest.fn((channelId, callback) => callback(false)),
  deleteChannel: jest.fn(),
}));

// Mock react-native-thermal-printer
jest.mock('react-native-thermal-printer', () => ({
  BLEPrinter: jest.fn().mockImplementation(() => ({
    connectPrinter: jest.fn(() => Promise.resolve()),
    closeConn: jest.fn(() => Promise.resolve()),
    printText: jest.fn(() => Promise.resolve()),
    printPic: jest.fn(() => Promise.resolve()),
  })),
}));

// Add static method to BLEPrinter mock
const mockBLEPrinter = require('react-native-thermal-printer').BLEPrinter;
mockBLEPrinter.deviceList = jest.fn(() => Promise.resolve([
  {
    device_name: 'Mock Thermal Printer 1',
    inner_mac_address: '00:11:22:33:44:55',
    device_id: 'mock-printer-1'
  },
  {
    device_name: 'Mock Thermal Printer 2',
    inner_mac_address: '00:11:22:33:44:56',
    device_id: 'mock-printer-2'
  }
]));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    requestCameraPermission: jest.fn(() => Promise.resolve('granted')),
    getCameraPermissionStatus: jest.fn(() => Promise.resolve('granted')),
    getAvailableCameraDevices: jest.fn(() => Promise.resolve([
      { id: 'back', position: 'back', hasFlash: true },
      { id: 'front', position: 'front', hasFlash: false }
    ])),
  },
  useCameraDevice: jest.fn(() => ({ id: 'back', position: 'back', hasFlash: true })),
  useCodeScanner: jest.fn(() => ({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: jest.fn(),
  })),
}));

// Mock WatermelonDB
jest.mock('@nozbe/watermelondb', () => ({
  Database: jest.fn().mockImplementation(() => ({
    collections: {
      get: jest.fn(() => ({
        create: jest.fn(() => Promise.resolve()),
        query: jest.fn(() => ({
          fetch: jest.fn(() => Promise.resolve([])),
        })),
        find: jest.fn(() => Promise.resolve(null)),
      })),
    },
    write: jest.fn((callback) => callback()),
  })),
  Model: jest.fn(),
  tableSchema: jest.fn(),
  appSchema: jest.fn(),
}));

jest.mock('@nozbe/watermelondb/adapters/sqlite', () => ({
  SQLiteAdapter: jest.fn().mockImplementation(() => ({})),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers for testing
jest.useFakeTimers();

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});

// Export test utilities
export const createMockDispatch = () => jest.fn();

export const createMockServices = () => ({
  postRepository: {
    createPost: jest.fn(),
    getAllPosts: jest.fn(),
    deletePost: jest.fn(),
  },
  fcmTokenRepository: {
    saveToken: jest.fn(),
    getToken: jest.fn(),
    removeToken: jest.fn(),
    hasToken: jest.fn(),
  },
  backgroundSyncService: {
    configureBackgroundFetch: jest.fn(),
    performSyncTask: jest.fn(),
  },
  permissionService: {
    requestNotificationPermission: jest.fn(),
    checkNotificationPermission: jest.fn(),
  },
  notificationService: {
    showNotification: jest.fn(),
    cancelNotification: jest.fn(),
    cancelAllNotifications: jest.fn(),
    createNotificationChannel: jest.fn(),
  },
  fcmService: {
    initialize: jest.fn(),
    getToken: jest.fn(),
    onTokenRefresh: jest.fn(),
    onMessage: jest.fn(),
    onBackgroundMessage: jest.fn(),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
  },
});

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));