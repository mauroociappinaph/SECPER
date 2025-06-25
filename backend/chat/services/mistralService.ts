import { Mistral } from '@mistralai/mistralai';
import { ChatMessage } from '../../types';
import { IMistralService } from '../../interfaces/services.interfaces';

/**
 * Servicio para manejar la comunicación con Mistral AI
 */
export class MistralService implements IMistralService {
  private client: Mistral;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY no está configurada en las variables de entorno');
    }
    this.client = new Mistral({ apiKey });
  }

  /**
   * Convierte mensajes al formato requerido por Mistral
   */
  private formatMessagesForMistral(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // Agregar prompt del sistema si se proporciona
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system' as const,
        content: systemPrompt,
      });
    }

    // Convertir mensajes de la conversación
    messages.forEach(msg => {
      if (msg.role !== 'system') {
        formattedMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    });

    return formattedMessages;
  }

  /**
   * Extrae el contenido de texto de la respuesta de Mistral
   */
  private extractTextContent(messageContent: any): string {
    if (typeof messageContent === 'string') {
      return messageContent;
    } else if (Array.isArray(messageContent)) {
      // Si el contenido es un array de ContentChunk, extraer solo el texto
      return messageContent
        .map(chunk => {
          if (typeof chunk === 'string') {
            return chunk;
          } else if (chunk.type === 'text') {
            return chunk.text;
          }
          return ''; // Ignorar otros tipos como imágenes
        })
        .join('');
    }
    return '';
  }

  /**
   * Envía mensajes a Mistral y obtiene la respuesta
   */
  async generateResponse(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<{
    content: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    try {
      const {
        model = 'mistral-large-latest',
        temperature = 0.7,
        maxTokens = 1000,
        systemPrompt,
      } = options;

      // Preparar mensajes para Mistral
      const mistralMessages = this.formatMessagesForMistral(messages, systemPrompt);

      // Llamar a Mistral API
      const response = await this.client.chat.complete({
        model,
        messages: mistralMessages,
        temperature,
        maxTokens,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No se recibió respuesta de Mistral');
      }

      const messageContent = response.choices[0].message?.content;
      const assistantContent = this.extractTextContent(messageContent);

      return {
        content: assistantContent,
        usage: {
          promptTokens: response.usage?.promptTokens || 0,
          completionTokens: response.usage?.completionTokens || 0,
          totalTokens: response.usage?.totalTokens || 0,
        },
      };
    } catch (error: any) {
      console.error('Error en MistralService.generateResponse:', error);
      throw new Error(`Error al comunicarse con Mistral: ${error.message}`);
    }
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!process.env.MISTRAL_API_KEY;
  }

  /**
   * Verifica el estado de salud del servicio
   */
  isHealthy(): boolean {
    return this.isConfigured();
  }
}
