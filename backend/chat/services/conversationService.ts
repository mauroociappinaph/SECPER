import { ChatMessage, ChatConversation } from '../../types';
import { prisma } from '../../database/prisma';

/**
 * Servicio para manejar conversaciones y mensajes usando Prisma
 */
export class ConversationService {
  /**
   * Crea un nuevo mensaje con los datos especificados.
   */
  createMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    conversationId?: string
  ): ChatMessage {
    return {
      id: '', // Se asignará por Prisma
      role,
      content,
      timestamp: new Date(),
      conversationId,
    };
  }

  /**
   * Retorna una conversación existente o crea una nueva si no existe.
   */
  async getOrCreateConversation(conversationId?: string): Promise<ChatConversation> {
    try {
      let conversation: any = null;
      if (conversationId) {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: true },
        });
      }
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { title: 'Nueva Conversación' },
          include: { messages: true },
        });
      }
      return this.mapConversation(conversation);
    } catch (error) {
      console.error(`[ConversationService.getOrCreateConversation] Error:`, error);
      throw new Error('Error al obtener o crear conversación');
    }
  }

  /**
   * Agrega un mensaje a una conversación existente.
   */
  async addMessageToConversation(
    conversationId: string,
    message: ChatMessage
  ): Promise<ChatConversation> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      await prisma.message.create({
        data: {
          role: message.role,
          content: message.content,
          conversationId: conversationId,
          timestamp: new Date(),
          model: (message as any).model,
          temperature: (message as any).temperature,
          maxTokens: (message as any).maxTokens,
          promptTokens: (message as any).promptTokens,
          completionTokens: (message as any).completionTokens,
          totalTokens: (message as any).totalTokens,
        },
      });
      // Actualizar título si es el primer mensaje
      const updatedConversation = await this.autoUpdateConversationTitle(conversationId);
      return updatedConversation;
    } catch (error) {
      console.error(`[ConversationService.addMessageToConversation] Error:`, error);
      throw new Error('Error al agregar mensaje a la conversación');
    }
  }

  /**
   * Obtiene una conversación por su ID.
   */
  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { timestamp: 'asc' } } },
      });
      return conversation ? this.mapConversation(conversation) : null;
    } catch (error) {
      console.error(`[ConversationService.getConversation] Error:`, error);
      throw new Error('Error al obtener conversación');
    }
  }

  /**
   * Retorna una lista paginada de conversaciones.
   */
  async getAllConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: ChatConversation[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    try {
      const [conversations, totalCount] = await Promise.all([
        prisma.conversation.findMany({
          orderBy: { updatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { messages: { orderBy: { timestamp: 'asc' } } },
        }),
        prisma.conversation.count(),
      ]);
      return {
        conversations: conversations.map(this.mapConversation),
        totalCount,
        page,
        limit,
      };
    } catch (error) {
      console.error(`[ConversationService.getAllConversations] Error:`, error);
      throw new Error('Error al obtener conversaciones');
    }
  }

  /**
   * Elimina una conversación por su ID.
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await prisma.conversation.delete({ where: { id: conversationId } });
      return true;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return false;
      }
      console.error(`[ConversationService.deleteConversation] Error:`, error);
      throw new Error('Error al eliminar conversación');
    }
  }

  /**
   * Elimina todas las conversaciones almacenadas.
   */
  async clearAllConversations(): Promise<void> {
    try {
      await prisma.message.deleteMany();
      await prisma.conversation.deleteMany();
    } catch (error) {
      console.error(`[ConversationService.clearAllConversations] Error:`, error);
      throw new Error('Error al limpiar conversaciones');
    }
  }

  /**
   * Actualiza el título de una conversación.
   */
  async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    try {
      const updated = await prisma.conversation.update({
        where: { id: conversationId },
        data: { title: newTitle, updatedAt: new Date() },
      });
      return !!updated;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return false;
      }
      console.error(`[ConversationService.updateConversationTitle] Error:`, error);
      throw new Error('Error al actualizar título de la conversación');
    }
  }

  /**
   * Busca conversaciones que coincidan con un término.
   */
  async searchConversations(query: string): Promise<ChatConversation[]> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { messages: { some: { content: { contains: query } } } },
          ],
        },
        include: { messages: { orderBy: { timestamp: 'asc' } } },
      });
      return conversations.map(this.mapConversation);
    } catch (error) {
      console.error(`[ConversationService.searchConversations] Error:`, error);
      throw new Error('Error al buscar conversaciones');
    }
  }

  /**
   * Calcula estadísticas sobre las conversaciones almacenadas.
   */
  async getStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }> {
    try {
      const [totalConversations, totalMessages] = await Promise.all([
        prisma.conversation.count(),
        prisma.message.count(),
      ]);
      return {
        totalConversations,
        totalMessages,
        averageMessagesPerConversation:
          totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 100) / 100 : 0,
      };
    } catch (error) {
      console.error(`[ConversationService.getStats] Error:`, error);
      throw new Error('Error al calcular estadísticas');
    }
  }

  /**
   * Actualiza automáticamente el título de una conversación si es el primer mensaje.
   */
  private async autoUpdateConversationTitle(conversationId: string): Promise<ChatConversation> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    });
    if (!conversation) throw new Error('Conversación no encontrada');
    if (conversation.messages.length === 1) {
      const firstMessage = conversation.messages[0];
      if (firstMessage.role === 'user') {
        const newTitle =
          firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { title: newTitle },
        });
        conversation.title = newTitle;
      }
    }
    return this.mapConversation(conversation);
  }

  /**
   * Mapea una conversación de Prisma a ChatConversation
   */
  private mapConversation(conversation: any): ChatConversation {
    return {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      userId: conversation.userId,
      messages: (conversation.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        conversationId: msg.conversationId,
      })),
    };
  }
}

export const conversationService = new ConversationService();
