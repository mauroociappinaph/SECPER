import { Request, Response } from 'express';
import { calendarService } from '../services/calendarService';
import { CalendarValidators } from '../utils/calendarValidators';

/**
 * Controlador para operaciones relacionadas con el calendario
 */
export class CalendarController {
  /**
   * Crea un evento en el calendario
   */
  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [CalendarController.createEvent] Started`);

      // Validar la solicitud
      const validation = CalendarValidators.validateEventRequest(req.body);
      if (!validation.isValid) {
        console.warn(`[CalendarController.createEvent] Validation failed:`, validation.error);
        res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_ERROR',
        });
        return;
      }

      const result = await calendarService.createEvent(req.body);

      console.log(`[CalendarController.createEvent] Success:`, { eventCreated: true });
      res.status(200).json(result);
    } catch (error: unknown) {
      console.error(`[CalendarController.createEvent] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        error: errorMessage || 'Error al crear el evento',
        code: 'CALENDAR_ERROR',
      });
    }
  }
}
