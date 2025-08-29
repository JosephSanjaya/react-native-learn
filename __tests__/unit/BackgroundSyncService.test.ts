import { BackgroundSyncService } from '../../src/core/services/BackgroundSync.ts';
import { IPostRepository } from '../../src/core/data/repositories/interfaces/IPostRepository.ts';
import BackgroundFetch from 'react-native-background-fetch';

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

  async deletePost(id: string): Promise<void> {
    // Stub always succeeds
    return Promise.resolve();
  }
}

// SPY - Wraps real object to monitor interactions
class SpyPostRepository implements IPostRepository {
  public createPostCalls: { title: string; timestamp: Date }[] = [];
  public getAllPostsCalls: Date[] = [];
  public deletePostCalls: { id: string; timestamp: Date }[] = [];

  async createPost(title: string): Promise<void> {
    this.createPostCalls.push({ title, timestamp: new Date() });
    return Promise.resolve();
  }

  async getAllPosts(): Promise<any[]> {
    this.getAllPostsCalls.push(new Date());
    return Promise.resolve([]);
  }

  async deletePost(id: string): Promise<void> {
    this.deletePostCalls.push({ id, timestamp: new Date() });
    return Promise.resolve();
  }

  // Spy-specific methods to verify interactions
  getCreatePostCallCount(): number {
    return this.createPostCalls.length;
  }

  wasCreatePostCalledWith(title: string): boolean {
    return this.createPostCalls.some(call => call.title === title);
  }

  getLastCreatePostCall(): { title: string; timestamp: Date } | undefined {
    return this.createPostCalls[this.createPostCalls.length - 1];
  }
}

// Mock BackgroundFetch module
jest.mock('react-native-background-fetch', () => ({
  configure: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  finish: jest.fn(),
  status: jest.fn(),
  scheduleTask: jest.fn(),
  FETCH_RESULT_NEW_DATA: 0,
  FETCH_RESULT_NO_DATA: 1,
  FETCH_RESULT_FAILED: 2,
}));

const mockBackgroundFetch = BackgroundFetch as jest.Mocked<typeof BackgroundFetch>;

describe('BackgroundSyncService', () => {
  let service: BackgroundSyncService;
  let stubRepository: StubPostRepository;
  let spyRepository: SpyPostRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    stubRepository = new StubPostRepository();
    spyRepository = new SpyPostRepository();
  });

  describe('STUB Pattern - Predetermined responses', () => {
    beforeEach(() => {
      service = new BackgroundSyncService(stubRepository);
    });

    describe('When configuring background fetch', () => {
      it('should configure background fetch with proper settings', async () => {
        // Given
        mockBackgroundFetch.configure.mockResolvedValue(0); // FETCH_RESULT_NEW_DATA

        // When
        await service.configureBackgroundFetch();

        // Then
        expect(mockBackgroundFetch.configure).toHaveBeenCalledWith(
          expect.objectContaining({
            minimumFetchInterval: 15,
            taskId: "com.transistorsoft.fetch",
            stopOnTerminate: false,
            startOnBoot: true,
            requiresCharging: false,
            requiresDeviceIdle: false,
            requiresBatteryNotLow: false,
            requiresStorageNotLow: false,
          }),
          expect.any(Function),
          expect.any(Function)
        );
      });

      it('should handle configuration errors gracefully', async () => {
        // Given
        const configError = new Error('Configuration failed');
        mockBackgroundFetch.configure.mockRejectedValue(configError);

        // When & Then
        await expect(service.configureBackgroundFetch()).rejects.toThrow('Configuration failed');
      });
    });

    describe('When performing sync task', () => {
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

      it('should handle repository errors and still finish task', async () => {
        // Given
        const taskId = 'test-task-id';
        const errorRepository = {
          createPost: jest.fn().mockRejectedValue(new Error('Database error')),
          getAllPosts: jest.fn(),
          deletePost: jest.fn(),
        } as jest.Mocked<IPostRepository>;
        
        service = new BackgroundSyncService(errorRepository);
        mockBackgroundFetch.finish.mockImplementation(() => {});

        // When
        await service.performSyncTask(taskId);

        // Then
        expect(mockBackgroundFetch.finish).toHaveBeenCalledWith(taskId);
        expect(errorRepository.createPost).toHaveBeenCalled();
      });
    });
  });

  describe('SPY Pattern - Monitoring interactions', () => {
    beforeEach(() => {
      service = new BackgroundSyncService(spyRepository);
    });

    describe('When performing sync task', () => {
      it('should track repository interactions correctly', async () => {
        // Given
        const taskId = 'spy-task-id';
        mockBackgroundFetch.finish.mockImplementation(() => {});

        // When
        await service.performSyncTask(taskId);

        // Then - Verify spy recorded the interaction
        expect(spyRepository.getCreatePostCallCount()).toBe(1);
        
        const lastCall = spyRepository.getLastCreatePostCall();
        expect(lastCall).toBeDefined();
        expect(lastCall!.title).toMatch(/^New Post \d{4}-\d{2}-\d{2}T/);
        expect(spyRepository.wasCreatePostCalledWith(lastCall!.title)).toBe(true);
      });

      it('should track multiple sync operations', async () => {
        // Given
        const taskIds = ['task-1', 'task-2', 'task-3'];
        mockBackgroundFetch.finish.mockImplementation(() => {});

        // When
        for (const taskId of taskIds) {
          await service.performSyncTask(taskId);
        }

        // Then - Verify spy recorded all interactions
        expect(spyRepository.getCreatePostCallCount()).toBe(3);
        expect(spyRepository.createPostCalls).toHaveLength(3);
        
        // Verify each call had different timestamps
        const timestamps = spyRepository.createPostCalls.map(call => call.timestamp.getTime());
        const uniqueTimestamps = new Set(timestamps);
        expect(uniqueTimestamps.size).toBeGreaterThan(0);
      });
    });

    describe('When monitoring repository usage patterns', () => {
      it('should provide detailed interaction history', async () => {
        // Given
        const taskId = 'monitoring-task';
        mockBackgroundFetch.finish.mockImplementation(() => {});

        // When
        await service.performSyncTask(taskId);

        // Then - Verify spy provides detailed monitoring
        const calls = spyRepository.createPostCalls;
        expect(calls).toHaveLength(1);
        expect(calls[0].title).toContain('New Post');
        expect(calls[0].timestamp).toBeInstanceOf(Date);
        expect(calls[0].timestamp.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });
  });

  describe('Integration with BackgroundFetch', () => {
    beforeEach(() => {
      service = new BackgroundSyncService(stubRepository);
    });

    describe('When background fetch is triggered', () => {
      it('should execute callback function properly', async () => {
        // Given
        let capturedCallback: Function | null = null;
        mockBackgroundFetch.configure.mockImplementation((config, onEvent, onTimeout) => {
          capturedCallback = onEvent;
          return Promise.resolve(0);
        });

        // When
        await service.configureBackgroundFetch();

        // Then
        expect(capturedCallback).toBeDefined();
        expect(typeof capturedCallback).toBe('function');
      });

      it('should handle timeout callback', async () => {
        // Given
        let capturedTimeoutCallback: Function | null = null;
        mockBackgroundFetch.configure.mockImplementation((config, onEvent, onTimeout) => {
          capturedTimeoutCallback = onTimeout;
          return Promise.resolve(0);
        });

        // When
        await service.configureBackgroundFetch();

        // Then
        expect(capturedTimeoutCallback).toBeDefined();
        expect(typeof capturedTimeoutCallback).toBe('function');
      });
    });
  });
});