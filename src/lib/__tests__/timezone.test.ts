import { 
  getUserTimezone, 
  getCurrentDateInTimezone, 
  getCurrentTimestampInTimezone,
  isValidTimezone 
} from '../timezone';

// Mock Intl API for testing
const mockIntl = {
  DateTimeFormat: jest.fn()
};

// Mock window object
Object.defineProperty(window, 'Intl', {
  writable: true,
  value: mockIntl
});

describe('Timezone utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Intl mock
    mockIntl.DateTimeFormat.mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' })
    }));
  });

  describe('getUserTimezone', () => {
    it('should return user timezone when available', () => {
      const timezone = getUserTimezone();
      expect(timezone).toBe('America/New_York');
    });

    it('should return Asia/Tokyo as fallback when browser API fails', () => {
      mockIntl.DateTimeFormat.mockImplementation(() => {
        throw new Error('API not available');
      });
      
      const timezone = getUserTimezone();
      expect(timezone).toBe('Asia/Tokyo');
    });

    it('should return Asia/Tokyo as fallback in server environment', () => {
      // Simulate server environment
      const originalWindow = global.window;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).window;
      
      const timezone = getUserTimezone();
      expect(timezone).toBe('Asia/Tokyo');
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('getCurrentDateInTimezone', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = getCurrentDateInTimezone('America/New_York');
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should use user timezone when no timezone specified', () => {
      const date = getCurrentDateInTimezone();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle invalid timezone gracefully', () => {
      const date = getCurrentDateInTimezone('Invalid/Timezone');
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getCurrentTimestampInTimezone', () => {
    it('should return timestamp string', () => {
      const timestamp = getCurrentTimestampInTimezone('Asia/Tokyo');
      expect(typeof timestamp).toBe('string');
      expect(timestamp.length).toBeGreaterThan(0);
    });

    it('should handle invalid timezone gracefully', () => {
      const timestamp = getCurrentTimestampInTimezone('Invalid/Timezone');
      expect(typeof timestamp).toBe('string');
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format fallback
    });
  });

  describe('isValidTimezone', () => {
    it('should return true for valid timezones', () => {
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
    });

    it('should return false for invalid timezones', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('NotA/RealPlace')).toBe(false);
      expect(isValidTimezone('')).toBe(false);
    });
  });
});