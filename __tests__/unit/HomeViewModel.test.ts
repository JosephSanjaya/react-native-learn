// MOCK Pattern Demonstration - Complete dependency replacement with jest.fn()

describe('MOCK Pattern - Complete dependency replacement', () => {
  // MOCK - Complete replacement of dependencies with jest.fn()
  const mockBackgroundService = {
    performSyncTask: jest.fn(),
    configureBackgroundFetch: jest.fn(),
  };

  const mockPermissionService = {
    requestNotificationPermission: jest.fn(),
    checkNotificationPermission: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When performing manual sync', () => {
    it('should call background sync service with mock', async () => {
      // Given
      mockBackgroundService.performSyncTask.mockResolvedValue(undefined);

      // When
      await mockBackgroundService.performSyncTask('manual');

      // Then
      expect(mockBackgroundService.performSyncTask).toHaveBeenCalledWith('manual');
      expect(mockBackgroundService.performSyncTask).toHaveBeenCalledTimes(1);
    });

    it('should handle sync errors with mock', async () => {
      // Given
      const errorMessage = 'Sync failed';
      mockBackgroundService.performSyncTask.mockRejectedValue(new Error(errorMessage));

      // When & Then
      await expect(mockBackgroundService.performSyncTask('manual')).rejects.toThrow(errorMessage);
    });
  });

  describe('When requesting notification permission', () => {
    it('should mock permission service responses', async () => {
      // Given
      const permissionStatus = 'granted';
      mockPermissionService.requestNotificationPermission.mockResolvedValue(permissionStatus);

      // When
      const result = await mockPermissionService.requestNotificationPermission();

      // Then
      expect(result).toBe(permissionStatus);
      expect(mockPermissionService.requestNotificationPermission).toHaveBeenCalled();
    });
  });
});