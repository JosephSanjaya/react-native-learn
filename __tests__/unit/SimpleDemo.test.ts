// Simple Test Double Demonstrations
// This file demonstrates all 5 test double patterns: Dummy, Stub, Fake, Spy, Mock

describe('Test Double Patterns Demonstration', () => {
  describe('MOCK Pattern - Complete replacement with jest.fn()', () => {
    it('should track calls and return predetermined values', () => {
      // Given - MOCK with jest.fn()
      const mockService = {
        getData: jest.fn().mockReturnValue('mocked data'),
        saveData: jest.fn().mockResolvedValue(true),
      };

      // When
      const result = mockService.getData();
      mockService.saveData('test data');

      // Then - Verify interactions and return values
      expect(result).toBe('mocked data');
      expect(mockService.getData).toHaveBeenCalled();
      expect(mockService.saveData).toHaveBeenCalledWith('test data');
    });
  });

  describe('STUB Pattern - Predetermined responses', () => {
    class StubWeatherService {
      getTemperature(): number {
        return 25; // Always returns 25 degrees
      }
      
      getWeatherCondition(): string {
        return 'sunny'; // Always returns sunny
      }
    }

    it('should return predetermined responses', () => {
      // Given - STUB with fixed responses
      const stubService = new StubWeatherService();

      // When
      const temperature = stubService.getTemperature();
      const condition = stubService.getWeatherCondition();

      // Then - Always same predetermined values
      expect(temperature).toBe(25);
      expect(condition).toBe('sunny');
    });
  });

  describe('FAKE Pattern - Simplified working implementation', () => {
    class FakeDatabase {
      private data: Map<string, any> = new Map();

      save(key: string, value: any): void {
        this.data.set(key, value);
      }

      get(key: string): any {
        return this.data.get(key);
      }

      exists(key: string): boolean {
        return this.data.has(key);
      }
    }

    it('should provide working simplified implementation', () => {
      // Given - FAKE with actual working logic
      const fakeDb = new FakeDatabase();

      // When
      fakeDb.save('user1', { name: 'John', age: 30 });
      const user = fakeDb.get('user1');
      const exists = fakeDb.exists('user1');

      // Then - Works like real implementation but simpler
      expect(user).toEqual({ name: 'John', age: 30 });
      expect(exists).toBe(true);
      expect(fakeDb.exists('nonexistent')).toBe(false);
    });
  });

  describe('SPY Pattern - Monitoring interactions', () => {
    class SpyEmailService {
      public sentEmails: Array<{ to: string; subject: string; body: string }> = [];
      public sendCallCount: number = 0;

      sendEmail(to: string, subject: string, body: string): boolean {
        this.sendCallCount++;
        this.sentEmails.push({ to, subject, body });
        return true;
      }

      getSentEmailsCount(): number {
        return this.sentEmails.length;
      }

      wasEmailSentTo(email: string): boolean {
        return this.sentEmails.some(e => e.to === email);
      }
    }

    it('should monitor and record interactions', () => {
      // Given - SPY that records interactions
      const spyService = new SpyEmailService();

      // When
      spyService.sendEmail('user@example.com', 'Welcome', 'Welcome to our service');
      spyService.sendEmail('admin@example.com', 'Alert', 'System alert');

      // Then - Verify interactions were recorded
      expect(spyService.sendCallCount).toBe(2);
      expect(spyService.getSentEmailsCount()).toBe(2);
      expect(spyService.wasEmailSentTo('user@example.com')).toBe(true);
      expect(spyService.wasEmailSentTo('nonexistent@example.com')).toBe(false);
      
      // Verify specific interaction details
      expect(spyService.sentEmails[0]).toEqual({
        to: 'user@example.com',
        subject: 'Welcome',
        body: 'Welcome to our service'
      });
    });
  });

  describe('DUMMY Pattern - Unused parameter objects', () => {
    function processUserData(userData: any, config: any, logger: any): string {
      // Only uses userData.name, other parameters are dummy/unused
      return `Processed: ${userData.name}`;
    }

    it('should handle dummy objects that are not actually used', () => {
      // Given - DUMMY objects (content doesn't matter for test)
      const dummyUser = { name: 'Test User', email: 'dummy@example.com', age: 25 };
      const dummyConfig = { setting1: 'value1', setting2: 'value2' };
      const dummyLogger = { log: () => {}, error: () => {} };

      // When - Pass dummy objects (only name is actually used)
      const result = processUserData(dummyUser, dummyConfig, dummyLogger);

      // Then - Function works, dummy objects served their purpose
      expect(result).toBe('Processed: Test User');
      // Note: dummyConfig and dummyLogger content doesn't matter for this test
    });
  });
});
