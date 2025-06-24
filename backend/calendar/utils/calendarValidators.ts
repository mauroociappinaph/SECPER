/**
 * Utilidades para validar datos del calendario
 */
export class CalendarValidators {
  /**
   * Valida una solicitud de creación de evento
   */
  static validateEventRequest(data: unknown): { isValid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Los datos del evento son requeridos' };
    }

    // Validar summary (título)
    if (!data.summary || typeof data.summary !== 'string') {
      return {
        isValid: false,
        error: 'El título del evento es requerido y debe ser una cadena de texto',
      };
    }

    if (data.summary.trim() === '') {
      return { isValid: false, error: 'El título del evento no puede estar vacío' };
    }

    if (data.summary.length > 200) {
      return {
        isValid: false,
        error: 'El título del evento es demasiado largo (máximo 200 caracteres)',
      };
    }

    // Validar fechas
    if (!data.start || typeof data.start !== 'string') {
      return {
        isValid: false,
        error: 'La fecha de inicio es requerida y debe ser una cadena de texto',
      };
    }

    if (!data.end || typeof data.end !== 'string') {
      return {
        isValid: false,
        error: 'La fecha de fin es requerida y debe ser una cadena de texto',
      };
    }

    // Validar formato de fechas ISO
    const startDate = new Date(data.start);
    const endDate = new Date(data.end);

    if (isNaN(startDate.getTime())) {
      return {
        isValid: false,
        error: 'La fecha de inicio no tiene un formato válido (usar ISO 8601)',
      };
    }

    if (isNaN(endDate.getTime())) {
      return {
        isValid: false,
        error: 'La fecha de fin no tiene un formato válido (usar ISO 8601)',
      };
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (endDate <= startDate) {
      return { isValid: false, error: 'La fecha de fin debe ser posterior a la fecha de inicio' };
    }

    // Validar que el evento no sea en el pasado
    const now = new Date();
    if (startDate < now) {
      return { isValid: false, error: 'No se pueden crear eventos en el pasado' };
    }

    // Validar descripción (opcional)
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        return { isValid: false, error: 'La descripción debe ser una cadena de texto' };
      }
      if (data.description.length > 1000) {
        return {
          isValid: false,
          error: 'La descripción es demasiado larga (máximo 1000 caracteres)',
        };
      }
    }

    // Validar attendees (opcional)
    if (data.attendees !== undefined) {
      if (!Array.isArray(data.attendees)) {
        return { isValid: false, error: 'Los invitados deben ser un array' };
      }

      if (data.attendees.length > 50) {
        return { isValid: false, error: 'Demasiados invitados (máximo 50)' };
      }

      // Validar formato de emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const attendee of data.attendees) {
        if (typeof attendee !== 'string' || !emailRegex.test(attendee)) {
          return { isValid: false, error: `Email inválido: ${attendee}` };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Valida un ID de evento
   */
  static validateEventId(eventId: string): { isValid: boolean; error?: string } {
    if (!eventId || typeof eventId !== 'string') {
      return { isValid: false, error: 'ID de evento requerido' };
    }

    if (eventId.trim() === '') {
      return { isValid: false, error: 'ID de evento no puede estar vacío' };
    }

    return { isValid: true };
  }

  /**
   * Valida parámetros de fecha para consultas
   */
  static validateDateRange(
    startDate?: string,
    endDate?: string
  ): { isValid: boolean; error?: string } {
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return { isValid: false, error: 'Fecha de inicio inválida' };
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return { isValid: false, error: 'Fecha de fin inválida' };
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return { isValid: false, error: 'La fecha de fin debe ser posterior a la fecha de inicio' };
      }
    }

    return { isValid: true };
  }
}
