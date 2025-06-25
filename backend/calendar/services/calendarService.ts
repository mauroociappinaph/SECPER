import axios from 'axios';
import { ZAPIER_MCP_URL } from '../../config/constants';
import { createCalendarEvent as CalendarEventType } from '../../types';
import { CalendarServiceError } from '../../utils/errors';
import { ICalendarService } from '../../types/services.interfaces';

/**
 * Servicio para manejar operaciones de calendario
 */
export class CalendarService implements ICalendarService {
  /**
   * Crea un evento en el calendario usando el MCP de Zapier
   */
  async createEvent(event: CalendarEventType): Promise<unknown> {
    try {
      console.log(`[${new Date().toISOString()}] [CalendarService.createEvent] Creating event:`, {
        summary: event.summary,
        start: event.start,
        end: event.end,
        attendeesCount: event.attendees?.length || 0,
      });

      const response = await axios.post(ZAPIER_MCP_URL, {
        instructions: `Crear un evento titulado '${event.summary}'${
          event.description ? `, descripción: '${event.description}'` : ''
        } que empieza el ${event.start} y termina el ${event.end}${
          event.attendees && event.attendees.length
            ? `, invitados: ${event.attendees.join(', ')}`
            : ''
        }.`,
      });

      console.log(`[CalendarService.createEvent] Event created successfully`);
      return response.data;
    } catch (error: unknown) {
      console.error(`[CalendarService.createEvent] Error:`, error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error recibido desde el servidor de Zapier
          console.error('Error response from Zapier:', {
            status: error.response.status,
            data: error.response.data,
          });
          throw new CalendarServiceError(
            `Error Zapier: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
            'ZAPIER_API_ERROR',
            { status: error.response.status, data: error.response.data }
          );
        } else {
          // Error de red
          console.error('Network error:', error.message);
          throw new CalendarServiceError(`Error de conexión: ${error.message}`, 'NETWORK_ERROR', {
            originalError: error.message,
          });
        }
      }

      // Error desconocido
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new CalendarServiceError(`Error desconocido: ${errorMessage}`, 'UNKNOWN_ERROR', {
        originalError: errorMessage,
      });
    }
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!ZAPIER_MCP_URL;
  }

  /**
   * Verifica si el servicio está funcionando correctamente
   */
  isHealthy(): boolean {
    return !!ZAPIER_MCP_URL;
  }
}

// Instancia singleton del servicio
export const calendarService = new CalendarService();
