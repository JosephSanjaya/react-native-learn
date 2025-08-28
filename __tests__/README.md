# Test Documentation - BDD Approach with Test Doubles

This document explains the comprehensive test suite for the WorkManagerSample React Native application, demonstrating the use of different test doubles (Dummy, Stub, Fake, Spy, Mock) with BDD (Behavior-Driven Development) approach.

## Test Structure Overview

```
__tests__/
├── setup/
│   └── testSetup.ts          # Global test configuration and mocks
├── unit/
│   ├── HomeViewModel.test.ts      # MOCK pattern - Complete dependency replacement
│   ├── BackgroundSyncService.test.ts # STUB & SPY patterns - Predetermined responses & monitoring
│   ├── FCMService.test.ts         # FAKE & DUMMY patterns - Working implementation & parameter objects
│   ├── BluetoothService.test.ts   # FAKE & DUMMY patterns - Bluetooth printer testing
│   └── CameraService.test.ts      # SPY, STUB, FAKE & DUMMY patterns - Camera functionality
└── integration/
    └── AppInitializer.test.ts     # MOCK & SPY patterns - Service orchestration testing
```

## Test Double Patterns Explained

### 1. DUMMY Pattern
**Purpose**: Objects that are passed around but never actually used. They're needed to fill parameter lists.

**Example from CameraService.test.ts**:
```typescript
// DUMMY - Simple objects that are passed around but never used
const createDummyBarcodeResult = (): BarcodeResult => ({
  value: 'dummy-barcode-value',
  type: 'dummy-type'
});

describe('DUMMY Pattern - Objects passed but never used', () => {
  it('should accept dummy barcode results in callback setup', () => {
    // Given
    const dummyBarcode = createDummyBarcodeResult();
    const dummyCallback = jest.fn();

    // When - Pass dummy objects (content doesn't matter for test structure)
    const unsubscribe = cameraService.onBarcodeDetected(dummyCallback);

    // Then
    expect(typeof unsubscribe).toBe('function');
    expect(dummyBarcode.value).toBe('dummy-barcode-value');
  });
});
```

**When to use**: When you need objects to satisfy method signatures but the actual content doesn't matter for the test.

### 2. STUB Pattern
**Purpose**: Provides predetermined responses to method calls. Always returns the same canned responses.

**Example from BackgroundSyncService.test.ts**:
```typescript
// STUB - Provides predetermined responses
class StubPostRepository implements IPostRepository {
  async createPost(title: string): Promise<void> {
    // Stub always succeeds with predetermined behavior
    return Promise.resolve();
  }

  async getAllPosts(): Promise<any[]> {
    // Stub returns predetermined data
    return Promise.resolve([
      { id: '1', title: 'Stub Post 1', createdAt: new Date() },
      { id: '2', title: 'Stub Post 2', createdAt: new Date() }
    ]);
  }
}

describe('STUB Pattern - Predetermined responses', () => {
  it('should create new post and finish task successfully', async () => {
    // Given
    const taskId = 'test-task-id';
    mockBackgroundFetch.finish.mockImplementation(() => {});

    // When
    await service.performSyncTask(taskId);

    // Then
    expect(mockBackgroundFetch.finish).toHaveBeenCalledWith(taskId);
    // Stub repository always succeeds, so no error should be thrown
  });
});
```

**When to use**: When you need predictable responses and don't care about the internal logic, just the output.

### 3. FAKE Pattern
**Purpose**: Working implementation with simplified behavior. Has business logic but takes shortcuts.

**Example from FCMService.test.ts**:
```typescript
// FAKE - Working implementation with simplified behavior
class FakeFCMTokenRepository implements IFCMTokenRepository {
  private storage: Map<string, string> = new Map();
  private readonly FCM_TOKEN_KEY = '@fcm_token';

  async saveToken(token: string): Promise<void> {
    this.storage.set(this.FCM_TOKEN_KEY, token);
    return Promise.resolve();
  }

  async getToken(): Promise<string | null> {
    return Promise.resolve(this.storage.get(this.FCM_TOKEN_KEY) || null);
  }

  // Fake-specific methods for testing
  clear(): void {
    this.storage.clear();
  }

  getStorageSize(): number {
    return this.storage.size;
  }
}

describe('FAKE Pattern - Working implementation with simplified behavior', () => {
  it('should get token and save to fake repository', async () => {
    // Given
    const expectedToken = 'fake-fcm-token-123';
    mockMessagingInstance.getToken.mockResolvedValue(expectedToken);

    // When
    await fcmService.initialize();

    // Then
    // Verify fake repository behavior
    const savedToken = await fakeRepository.getToken();
    expect(savedToken).toBe(expectedToken);
    expect(fakeRepository.getStorageSize()).toBe(1);
  });
});
```

**When to use**: When you need a working implementation but want to avoid external dependencies like databases or APIs.

### 4. SPY Pattern
**Purpose**: Wraps real objects to monitor interactions. Records information about how methods were called.

**Example from BackgroundSyncService.test.ts**:
```typescript
// SPY - Wraps real object to monitor interactions
class SpyPostRepository implements IPostRepository {
  public createPostCalls: { title: string; timestamp: Date }[] = [];
  public getAllPostsCalls: Date[] = [];

  async createPost(title: string): Promise<void> {
    this.createPostCalls.push({ title, timestamp: new Date() });
    return Promise.resolve();
  }

  // Spy-specific methods to verify interactions
  getCreatePostCallCount(): number {
    return this.createPostCalls.length;
  }

  wasCreatePostCalledWith(title: string): boolean {
    return this.createPostCalls.some(call => call.title === title);
  }
}

describe('SPY Pattern - Monitoring interactions', () => {
  it('should track repository interactions correctly', async () => {
    // Given
    const taskId = 'spy-task-id';

    // When
    await service.performSyncTask(taskId);

    // Then - Verify spy recorded the interaction
    expect(spyRepository.getCreatePostCallCount()).toBe(1);
    const lastCall = spyRepository.getLastCreatePostCall();
    expect(lastCall!.title).toMatch(/^New Post \d{4}-\d{2}-\d{2}T/);
  });
});
```

**When to use**: When you need to verify that certain methods were called with specific parameters or in a specific order.

### 5. MOCK Pattern
**Purpose**: Complete replacement of dependencies with jest.fn(). Pre-programmed with expectations.

**Example from HomeViewModel.test.ts**:
```typescript
// MOCK - Complete replacement of dependencies with jest.fn()
const mockServices = {
  backgroundSyncService: {
    configureBackgroundFetch: jest.fn(),
    performSyncTask: jest.fn(),
  } as jest.Mocked<IBackgroundSyncService>,
  
  permissionService: {
    requestNotificationPermission: jest.fn(),
    checkNotificationPermission: jest.fn(),
  } as jest.Mocked<IPermissionService>,
};

describe('MOCK Pattern - Complete dependency replacement', () => {
  it('should dispatch sync start action and call background sync service', async () => {
    // Given
    mockServices.backgroundSyncService.performSyncTask.mockResolvedValue();

    // When
    await viewModel.performManualSync();

    // Then
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'PERFORM_SYNC_START' });
    expect(mockServices.backgroundSyncService.performSyncTask).toHaveBeenCalledWith('manual');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'PERFORM_SYNC_SUCCESS' });
  });
});
```

**When to use**: When you need complete control over dependencies and want to verify exact interactions.

## BDD Test Structure

All tests follow the **Given-When-Then** BDD pattern:

```typescript
describe('Feature: Background sync functionality', () => {
  describe('Scenario: Manual sync is triggered', () => {
    it('should perform sync and update state accordingly', async () => {
      // Given - Setup the initial state and conditions
      mockServices.backgroundSyncService.performSyncTask.mockResolvedValue();

      // When - Execute the action being tested
      await viewModel.performManualSync();

      // Then - Verify the expected outcomes
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'PERFORM_SYNC_START' });
      expect(mockServices.backgroundSyncService.performSyncTask).toHaveBeenCalledWith('manual');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'PERFORM_SYNC_SUCCESS' });
    });
  });
});
```

## Test Categories by Class/Function

### HomeViewModel Tests (MOCK Pattern)
- **Purpose**: Test MVI state management and action dispatching
- **Pattern**: MOCK - Complete dependency replacement
- **Focus**: State transitions, error handling, loading states
- **Key Tests**:
  - Manual sync operations
  - Permission request handling
  - Error state management
  - State reducer logic

### BackgroundSyncService Tests (STUB & SPY Patterns)
- **Purpose**: Test background task execution and repository interactions
- **Patterns**: STUB for predetermined responses, SPY for interaction monitoring
- **Focus**: Task execution, error handling, repository calls
- **Key Tests**:
  - Background fetch configuration
  - Sync task execution with stubs
  - Repository interaction tracking with spies
  - Error handling scenarios

### FCMService Tests (FAKE & DUMMY Patterns)
- **Purpose**: Test Firebase Cloud Messaging integration
- **Patterns**: FAKE for working token repository, DUMMY for parameter objects
- **Focus**: Token management, message handling, topic subscriptions
- **Key Tests**:
  - FCM initialization with fake repository
  - Token refresh handling
  - Message processing with dummy data
  - Error scenarios

### BluetoothService Tests (FAKE & DUMMY Patterns)
- **Purpose**: Test Bluetooth printer connectivity and operations
- **Patterns**: FAKE for working printer implementation, DUMMY for device objects
- **Focus**: Device scanning, connection management, printing operations
- **Key Tests**:
  - Device scanning with fake devices
  - Connection establishment
  - Printing operations with dummy content
  - Mock development mode

### CameraService Tests (SPY, STUB, FAKE & DUMMY Patterns)
- **Purpose**: Test camera permissions and barcode scanning
- **Patterns**: All patterns demonstrated
- **Focus**: Permission management, barcode detection, camera availability
- **Key Tests**:
  - Permission tracking with spy
  - Predetermined camera responses with stub
  - Working barcode scanner with fake
  - Parameter objects with dummy

### AppInitializer Integration Tests (MOCK & SPY Patterns)
- **Purpose**: Test service orchestration and initialization sequence
- **Patterns**: MOCK for service replacement, SPY for sequence monitoring
- **Focus**: Service initialization order, error handling, performance
- **Key Tests**:
  - Complete service initialization
  - Parallel initialization timing
  - Failure scenario handling
  - Initialization sequence tracking

## Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test HomeViewModel.test.ts

# Run tests with coverage
yarn test --coverage

# Run tests in watch mode
yarn test --watch

# Run integration tests only
yarn test __tests__/integration/

# Run unit tests only
yarn test __tests__/unit/
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for ViewModels and Services
- **Integration Tests**: Key service orchestration scenarios
- **Error Handling**: All error paths covered
- **Edge Cases**: Boundary conditions and failure scenarios

## Best Practices Demonstrated

1. **Clear Test Structure**: Given-When-Then BDD pattern
2. **Appropriate Test Doubles**: Right pattern for each scenario
3. **Isolated Testing**: Each test is independent
4. **Comprehensive Coverage**: Happy path, error cases, edge cases
5. **Readable Tests**: Descriptive test names and clear assertions
6. **Mock Management**: Proper setup and cleanup
7. **Performance Testing**: Timing and sequence verification
8. **Error Scenarios**: Comprehensive failure testing

This test suite provides a comprehensive example of how to test a complex React Native application using different test double patterns with BDD approach, ensuring maintainable, reliable, and well-documented tests.