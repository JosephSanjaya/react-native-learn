export interface IBackgroundSyncService {
  configureBackgroundFetch(): Promise<void>;
  performSyncTask(taskId: string): Promise<void>;
}