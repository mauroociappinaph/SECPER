export interface createCalendarEvent {
  summary: string; // Título del evento
  description?: string;
  start: string; // Fecha y hora de inicio en formato ISO (ej: '2024-06-01T10:00:00Z')
  end: string;   // Fecha y hora de fin en formato ISO
  attendees?: string[]; // Correos de los invitados
}


