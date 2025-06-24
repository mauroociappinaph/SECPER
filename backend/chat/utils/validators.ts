import { ChatRequest } from '../../types';

/**
 * Utilidades para validar datos del chat
 */
export class ChatValidators {
  
  /**
   * Valida un mensaje de chat
   */
  static validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'El mensaje es requerido y debe ser una cadena de texto' };
    }

    if (message.trim() === '') {
      return { isValid: false, error: 'El mensaje no puede estar vacío' };
    }

    if (message.length > 4000) {
      return { isValid: false, error: 'El mensaje es demasiado largo (máximo 4000 caracteres)' };
    }

    return { isValid: true };
  }

  /**
   * Valida un ID de conversación
   */
  static validateConversationId(conversationId: string): { isValid: boolean; error?: string } {
    if (!conversationId || typeof conversationId !== 'string') {
      return { isValid: false, error: 'ID de conversación requerido' };
    }

    if (conversationId.trim() === '') {
      return { isValid: false, error: 'ID de conversación no puede estar vacío' };
    }

    // Validar formato UUID (opcional, pero recomendado)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      return { isValid: false, error: 'Formato de ID de conversación inválido' };
    }

    return { isValid: true };
  }

  /**
   * Valida un título de conversación
   */
  static validateTitle(title: string): { isValid: boolean; error?: string } {
    if (!title || typeof title !== 'string') {
      return { isValid: false, error: 'El título es requerido y debe ser una cadena de texto' };
    }

    if (title.trim() === '') {
      return { isValid: false, error: 'El título no puede estar vacío' };
    }

    if (title.length > 100) {
      return { isValid: false, error: 'El título es demasiado largo (máximo 100 caracteres)' };
    }

    return { isValid: true };
  }

  /**
   * Valida parámetros de paginación
   */
  static validatePagination(page: number, limit: number): { isValid: boolean; error?: string } {
    if (page < 1) {
      return { isValid: false, error: 'El número de página debe ser mayor a 0' };
    }

    if (limit < 1 || limit > 100) {
      return { isValid: false, error: 'El límite debe estar entre 1 y 100' };
    }

    return { isValid: true };
  }

  /**
   * Valida una consulta de búsqueda
   */
  static validateSearchQuery(query: string): { isValid: boolean; error?: string } {
    if (!query || typeof query !== 'string') {
      return { isValid: false, error: 'Parámetro de búsqueda requerido' };
    }

    if (query.trim().length < 2) {
      return { isValid: false, error: 'La búsqueda debe tener al menos 2 caracteres' };
    }

    if (query.length > 200) {
      return { isValid: false, error: 'La consulta de búsqueda es demasiado larga (máximo 200 caracteres)' };
    }

    return { isValid: true };
  }

  /**
   * Valida una solicitud de chat completa
   */
  static validateChatRequest(request: ChatRequest): { isValid: boolean; error?: string } {
    // Validar mensaje
    const messageValidation = this.validateMessage(request.message);
    if (!messageValidation.isValid) {
      return messageValidation;
    }

    // Validar conversationId si se proporciona
    if (request.conversationId) {
      const conversationValidation = this.validateConversationId(request.conversationId);
      if (!conversationValidation.isValid) {
        return conversationValidation;
      }
    }

    // Validar parámetros opcionales
    if (request.temperature !== undefined) {
      if (typeof request.temperature !== 'number' || request.temperature < 0 || request.temperature > 2) {
        return { isValid: false, error: 'La temperatura debe ser un número entre 0 y 2' };
      }
    }

    if (request.maxTokens !== undefined) {
      if (typeof request.maxTokens !== 'number' || request.maxTokens < 1 || request.maxTokens > 4000) {
        return { isValid: false, error: 'maxTokens debe ser un número entre 1 y 4000' };
      }
    }

    if (request.systemPrompt !== undefined) {
      if (typeof request.systemPrompt !== 'string' || request.systemPrompt.length > 1000) {
        return { isValid: false, error: 'systemPrompt debe ser una cadena de texto de máximo 1000 caracteres' };
      }
    }

    return { isValid: true };
  }
}