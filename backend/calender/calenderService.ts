import axios from 'axios';
import { ZAPIER_MCP_URL } from "../constantes/constant";
import { createCalendarEvent } from '../types';


/**
 * Crea un evento en el calendario usando el MCP de Zapier
 * @param {CalendarEvent} event - Datos del evento
 * @returns {Promise<any>} - Respuesta de Zapier
 */
export async function createCalendarEvent(event: createCalendarEvent): Promise<any> {
  try {
    const response = await axios.post(ZAPIER_MCP_URL, {
      instructions: `Crear un evento titulado '${event.summary}'${event.description ? `, descripción: '${event.description}'` : ''} que empieza el ${event.start} y termina el ${event.end}${event.attendees && event.attendees.length ? `, invitados: ${event.attendees.join(', ')}` : ''}.`,
      // Puedes agregar más campos según lo que requiera tu flujo de Zapier
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Error recibido desde el servidor de Zapier
      console.error('Error creando evento en el calendario:', error.response.status, error.response.data);
      throw new Error(`Error Zapier: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      // Otro tipo de error (por ejemplo, de red)
      console.error('Error creando evento en el calendario:', error.message);
      throw new Error(`Error desconocido: ${error.message}`);
    }
  }
}
