import { ChatRequest, ChatResponse, ChatSettings } from '../../types';
import { MistralService } from './mistralService';
import { ConversationService } from './conversationService';
import { IChatService } from '../../interfaces/services.interfaces';

/**
 * Servicio principal de chat que orquesta todas las operaciones
 */
export class ChatService implements IChatService {
  private mistralService: MistralService;
  private conversationService: ConversationService;
  private defaultSettings: ChatSettings;

  constructor() {
    this.mistralService = new MistralService();
    this.conversationService = new ConversationService();
    this.defaultSettings = {
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt:
        'Eres un asistente inteligente y útil. Responde de manera clara, concisa y profesional.',
    };
  }

  /**
   * Envía un mensaje al chat y obtiene respuesta de Mistral
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const settings = { ...this.defaultSettings, ...request };

      // Obtener o crear conversación
      const conversation = await this.conversationService.getOrCreateConversation(
        request.conversationId
      );

      // Crear mensaje del usuario
      const userMessage = this.conversationService.createMessage(
        'user',
        request.message,
        conversation.id
      );
      await this.conversationService.addMessageToConversation(conversation.id, userMessage);

      // Obtener respuesta de Mistral
      const mistralResponse = await this.mistralService.generateResponse(conversation.messages, {
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        systemPrompt: settings.systemPrompt,
      });

      // Crear mensaje del asistente
      const assistantMessage = this.conversationService.createMessage(
        'assistant',
        mistralResponse.content,
        conversation.id
      );
      await this.conversationService.addMessageToConversation(conversation.id, assistantMessage);

      return {
        message: assistantMessage,
        conversationId: conversation.id,
        usage: mistralResponse.usage,
      };
    } catch (error: any) {
      console.error('Error en ChatService.sendMessage:', error);
      throw new Error(`Error al procesar mensaje: ${error.message}`);
    }
  }

  /**
   * Obtiene una conversación por ID
   */
  async getConversation(conversationId: string) {
    return await this.conversationService.getConversation(conversationId);
  }

  /**
   * Obtiene todas las conversaciones con paginación
   */
  async getAllConversations(page: number = 1, limit: number = 20) {
    return await this.conversationService.getAllConversations(page, limit);
  }

  /**
   * Elimina una conversación
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    return await this.conversationService.deleteConversation(conversationId);
  }

  /**
   * Limpia todas las conversaciones
   */
  async clearAllConversations(): Promise<void> {
    await this.conversationService.clearAllConversations();
  }

  /**
   * Actualiza el título de una conversación
   */
  async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    return await this.conversationService.updateConversationTitle(conversationId, newTitle);
  }

  /**
   * Busca en conversaciones por texto
   */
  async searchConversations(query: string) {
    return await this.conversationService.searchConversations(query);
  }

  /**
   * Obtiene estadísticas del chat
   */
  async getStats() {
    return await this.conversationService.getStats();
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return this.mistralService.isConfigured();
  }

  /**
   * Verifica el estado de salud del servicio
   */
  isHealthy(): boolean {
    return this.mistralService.isConfigured();
  }
}

// Instancia singleton del servicio
export const chatService = new ChatService();
