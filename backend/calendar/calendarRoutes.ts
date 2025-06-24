import { Router } from 'express';
import { CalendarController } from './controllers/calendarController';

const router = Router();

/**
 * POST /api/calendario/evento
 * Crea un nuevo evento en el calendario
 * Body: { summary: string, description?: string, start: string, end: string, attendees?: string[] }
 */
router.post('/evento', CalendarController.createEvent);

export default router;
