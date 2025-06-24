import { ChatRequest, ChatResponse, ChatSettings } from '../../types';
import { MistralService } from './mistralService';
import { ConversationService } from './conversationService';

/**
 * Servicio principal de chat que orquesta todas las operaciones
 */
export class ChatService {
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
      systemPrompt: 'Eres un asistente inteligente y útil. Responde de manera clara, concisa y profesional.'
    };
  }

  /**
   * Envía un mensaje al chat y obtiene respuesta de Mistral
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const settings = { ...this.defaultSettings, ...request };
      
      // Obtener o crear conversación
      const conversation = this.conversationService.getOrCreateConversation(request.conversationId);
      
      // Crear mensaje del usuario
      const userMessage = this.conversationService.createMessage('user', request.message, conversation.id);
      this.conversationService.addMessageToConversation(conversation.id, userMessage);
      
      // Obtener respuesta de Mistral
      const mistralResponse = await this.mistralService.generateResponse(
        conversation.messages,
        {
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt
        }
      );
      
      // Crear mensaje del asistente
      const assistantMessage = this.conversationService.createMessage(
        'assistant', 
        mistralResponse.content, 
        conversation.id
      );
      this.conversationService.addMessageToConversation(conversation.id, assistantMessage);

      return {
        message: assistantMessage,
        conversationId: conversation.id,
        usage: mistralResponse.usage
      };

    } catch (error: any) {
      console.error('Error en ChatService.sendMessage:', error);
      throw new Error(`Error al procesar mensaje: ${error.message}`);
    }
  }

  /**
   * Obtiene una conversación por ID
   */
  getConversation(conversationId: string) {
    return this.conversationService.getConversation(conversationId);
  }

  /**
   * Obtiene todas las conversaciones con paginación
   */
  getAllConversations(page: number = 1, limit: number = 20) {
    return this.conversationService.getAllConversations(page, limit);
  }

  /**
   * Elimina una conversación
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversationService.deleteConversation(conversationId);
  }

  /**
   * Limpia todas las conversaciones
   */
  clearAllConversations(): void {
    this.conversationService.clearAllConversations();
  }

  /**
   * Actualiza el título de una conversación
   */
  updateConversationTitle(conversationId: string, newTitle: string): boolean {
    return this.conversationService.updateConversationTitle(conversationId, newTitle);
  }

  /**
   * Busca en conversaciones por texto
   */
  searchConversations(query: string) {
    return this.conversationService.searchConversations(query);
  }

  /**
   * Obtiene estadísticas del chat
   */
  getStats() {
    return this.conversationService.getStats();
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isHealthy(): boolean {
    return this.mistralService.isConfigured();
  }
}

// Instancia singleton del servicio
export const chatService = new ChatService();