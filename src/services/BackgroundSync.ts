import BackgroundFetch from 'react-native-background-fetch';
import { database } from '../db';

const syncTask = async (taskId: string) => {
  console.log('[BackgroundFetch] taskId', taskId);

  // Simulate a sync process
  const postsCollection = database.collections.get('posts');
  await database.write(async () => {
    await postsCollection.create(post => {
      post.title = `New Post ${new Date().toISOString()}`;
    });
  });

  BackgroundFetch.finish(taskId);
};

export const configureBackgroundFetch = async () => {
  const status = await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // <-- minutes (15 is minimum)
      taskId: "com.transistorsoft.fetch",
      // Android options
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
      requiresCharging: false, // Default
      requiresDeviceIdle: false, // Default
      requiresBatteryNotLow: false, // Default
      requiresStorageNotLow: false, // Default
    },
    syncTask,
    (taskId) => {
      console.log('[BackgroundFetch] TIMEOUT taskId', taskId);
      BackgroundFetch.finish(taskId);
    }
  );

  console.log('[BackgroundFetch] configure status', status);
};
