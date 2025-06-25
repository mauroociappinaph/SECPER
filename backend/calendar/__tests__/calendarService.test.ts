/**
 * Tests para CalendarService
 */

import { CalendarService } from '../services/calendarService';

describe('CalendarService', () => {
  let calendarService: CalendarService;

  beforeEach(() => {
    calendarService = new CalendarService();
  });

  describe('isConfigured', () => {
    it('should return configuration status', () => {
      const isConfigured = calendarService.isConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });
  });

  describe('isHealthy', () => {
    it('should return health status', () => {
      const isHealthy = calendarService.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  // TODO: Agregar más tests específicos para funcionalidades de calendario
});
