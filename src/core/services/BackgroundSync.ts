import BackgroundFetch from 'react-native-background-fetch';
import { IPostRepository } from '../data/repositories/interfaces/IPostRepository.ts';
import { IBackgroundSyncService } from './IBackgroundSyncService.ts';

export class BackgroundSyncService implements IBackgroundSyncService {
  constructor(private postRepository: IPostRepository) {}

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

  async configureBackgroundFetch(): Promise<void> {
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        taskId: "com.transistorsoft.fetch",
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresBatteryNotLow: false,
        requiresStorageNotLow: false,
      },
      this.performSyncTask.bind(this),
      (taskId) => {
        console.log('[BackgroundFetch] TIMEOUT taskId', taskId);
        BackgroundFetch.finish(taskId);
      }
    );

    console.log('[BackgroundFetch] configure status', status);
  }
}
