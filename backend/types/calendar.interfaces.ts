/**
 * Interfaz que representa los datos necesarios para crear un evento en el calendario.
 *
 * @property summary - Título del evento.
 * @property description - (Opcional) Descripción adicional del evento.
 * @property start - Fecha y hora de inicio en formato ISO 8601 (ej: '2024-06-01T10:00:00Z').
 * @property end - Fecha y hora de finalización en formato ISO 8601.
 * @property attendees - (Opcional) Lista de correos electrónicos de los asistentes al evento.
 */
export interface createCalendarEvent {
  summary: string; // Título del evento
  description?: string;
  start: string; // Fecha y hora de inicio en formato ISO (ej: '2024-06-01T10:00:00Z')
  end: string; // Fecha y hora de fin en formato ISO
  attendees?: string[]; // Correos de los invitados
}
