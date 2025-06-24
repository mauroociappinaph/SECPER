import { ChatMessage, ChatConversation } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para manejar conversaciones y mensajes
 */
export class ConversationService {
  // Almacenamiento en memoria (en producción usar base de datos)
  private conversations: Map<string, ChatConversation> = new Map();

  /**
   * Genera un identificador único utilizando UUID.
   * @returns ID generado como string.
   */
  private generateId(): string {
    return uuidv4();
  }

  /**
   * Crea un nuevo mensaje con los datos especificados.
   * @param role - Rol del mensaje (user, assistant o system).
   * @param content - Contenido del mensaje.
   * @param conversationId - ID de la conversación (opcional).
   * @returns Objeto de tipo ChatMessage.
   */
  createMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    conversationId?: string
  ): ChatMessage {
    return {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date(),
      conversationId
    };
  }

  /**
   * Retorna una conversación existente o crea una nueva si no existe.
   * @param conversationId - ID de la conversación (opcional).
   * @returns Objeto de tipo ChatConversation.
   */
  getOrCreateConversation(conversationId?: string): ChatConversation {
    if (conversationId && this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }

    const newConversation: ChatConversation = {
      id: conversationId || this.generateId(),
      title: 'Nueva Conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations.set(newConversation.id, newConversation);
    return newConversation;
  }

  /**
   * Actualiza automáticamente el título de una conversación si es el primer mensaje.
   * @param conversation - Objeto de tipo ChatConversation.
   */
  private autoUpdateConversationTitle(conversation: ChatConversation): void {
    if (conversation.messages.length === 1) {
      const firstMessage = conversation.messages[0];
      if (firstMessage.role === 'user') {
        // Tomar las primeras 50 caracteres como título
        conversation.title = firstMessage.content.substring(0, 50) +
          (firstMessage.content.length > 50 ? '...' : '');
      }
    }
  }

  /**
   * Agrega un mensaje a una conversación existente.
   * @param conversationId - ID de la conversación.
   * @param message - Mensaje a agregar.
   * @returns Conversación actualizada.
   * @throws Error si la conversación no existe.
   */
  addMessageToConversation(conversationId: string, message: ChatMessage): ChatConversation {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    message.conversationId = conversationId;
    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    this.autoUpdateConversationTitle(conversation);
    this.conversations.set(conversationId, conversation);

    return conversation;
  }

  /**
   * Obtiene una conversación por su ID.
   * @param conversationId - ID de la conversación.
   * @returns Objeto ChatConversation o null si no se encuentra.
   */
  getConversation(conversationId: string): ChatConversation | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Retorna una lista paginada de conversaciones.
   * @param page - Número de página (por defecto 1).
   * @param limit - Cantidad por página (por defecto 20).
   * @returns Objeto con conversaciones, totalCount, página y límite.
   */
  getAllConversations(page: number = 1, limit: number = 20): {
    conversations: ChatConversation[];
    totalCount: number;
    page: number;
    limit: number;
  } {
    const allConversations = Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConversations = allConversations.slice(startIndex, endIndex);

    return {
      conversations: paginatedConversations,
      totalCount: allConversations.length,
      page,
      limit
    };
  }

  /**
   * Elimina una conversación por su ID.
   * @param conversationId - ID de la conversación a eliminar.
   * @returns True si fue eliminada, false si no se encontró.
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  /**
   * Elimina todas las conversaciones almacenadas.
   */
  clearAllConversations(): void {
    this.conversations.clear();
  }

  /**
   * Actualiza el título de una conversación.
   * @param conversationId - ID de la conversación.
   * @param newTitle - Nuevo título.
   * @returns True si fue actualizada, false si no se encontró.
   */
  updateConversationTitle(conversationId: string, newTitle: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = new Date();
      this.conversations.set(conversationId, conversation);
      return true;
    }
    return false;
  }

  /**
   * Busca conversaciones que coincidan con un término.
   * @param query - Término de búsqueda.
   * @returns Lista de conversaciones coincidentes.
   */
  searchConversations(query: string): ChatConversation[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.conversations.values()).filter(conversation =>
      conversation.title.toLowerCase().includes(searchTerm) ||
      conversation.messages.some(message =>
        message.content.toLowerCase().includes(searchTerm)
      )
    );
  }

  /**
   * Calcula estadísticas sobre las conversaciones almacenadas.
   * @returns Total de conversaciones, total de mensajes y promedio por conversación.
   */
  getStats(): {
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  } {
    const totalConversations = this.conversations.size;
    const totalMessages = Array.from(this.conversations.values())
      .reduce((sum, conv) => sum + conv.messages.length, 0);

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0
        ? Math.round(totalMessages / totalConversations * 100) / 100
        : 0
    };
  }
}
