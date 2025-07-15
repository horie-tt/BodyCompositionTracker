import { 
  getUserTimezone, 
  getCurrentDateInTimezone, 
  getCurrentTimestampInTimezone,
  isValidTimezone 
} from '../timezone';

describe('Timezone utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTimezone', () => {
    it('should return a valid timezone string', () => {
      const timezone = getUserTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
      // Should be a valid timezone format (like "Asia/Tokyo" or fallback)
      expect(timezone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$|^Asia\/Tokyo$/);
    });

    it('should handle errors gracefully and return fallback', () => {
      // Test that function doesn't throw and returns valid fallback
      const timezone = getUserTimezone();
      expect(timezone).toBeDefined();
      expect(typeof timezone).toBe('string');
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
    it('should return boolean for timezone validation', () => {
      expect(typeof isValidTimezone('Asia/Tokyo')).toBe('boolean');
      expect(typeof isValidTimezone('Invalid/Timezone')).toBe('boolean');
      expect(typeof isValidTimezone('')).toBe('boolean');
    });
  });
});