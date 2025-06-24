import { ChatService } from '../services/chatService';
import { MistralService } from '../services/mistralService';
import { ConversationService } from '../services/conversationService';
import { ChatRequest } from '../../types';

jest.mock('../services/mistralService');
jest.mock('../services/conversationService');

const mockConversation = {
  id: '1',
  title: 'Test',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: undefined,
};

describe('ChatService', () => {
  let chatService: ChatService;
  let conversationService: jest.Mocked<ConversationService>;
  let mistralService: jest.Mocked<MistralService>;

  beforeEach(() => {
    // @ts-ignore
    conversationService = new ConversationService() as jest.Mocked<ConversationService>;
    // @ts-ignore
    mistralService = new MistralService() as jest.Mocked<MistralService>;
    chatService = new ChatService();
    // Inyectar mocks
    // @ts-ignore
    chatService.conversationService = conversationService;
    // @ts-ignore
    chatService.mistralService = mistralService;
  });

  it('debe enviar un mensaje y recibir respuesta', async () => {
    const req: ChatRequest = { message: 'Hola', conversationId: undefined };
    conversationService.getOrCreateConversation.mockResolvedValue({
      ...mockConversation,
      messages: [],
    });
    conversationService.createMessage.mockReturnValue({
      id: 'm1',
      role: 'user',
      content: 'Hola',
      timestamp: new Date(),
      conversationId: '1',
    });
    conversationService.addMessageToConversation.mockResolvedValue({
      ...mockConversation,
      messages: [],
    });
    mistralService.generateResponse.mockResolvedValue({
      content: '¡Hola!',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    });
    conversationService.createMessage.mockReturnValueOnce({
      id: 'm2',
      role: 'assistant',
      content: '¡Hola!',
      timestamp: new Date(),
      conversationId: '1',
    });
    conversationService.addMessageToConversation.mockResolvedValueOnce({
      ...mockConversation,
      messages: [],
    });

    const res = await chatService.sendMessage(req);
    expect(res.message.content).toBe('¡Hola!');
    expect(res.conversationId).toBe('1');
    expect(mistralService.generateResponse).toHaveBeenCalled();
  });

  it('debe obtener una conversación', async () => {
    conversationService.getConversation.mockResolvedValue(mockConversation);
    const conv = await chatService.getConversation('1');
    expect(conv).toHaveProperty('id', '1');
  });

  it('debe listar conversaciones', async () => {
    conversationService.getAllConversations.mockResolvedValue({
      conversations: [mockConversation],
      totalCount: 1,
      page: 1,
      limit: 20,
    });
    const res = await chatService.getAllConversations(1, 20);
    expect(res.conversations.length).toBe(1);
  });

  it('debe eliminar una conversación', async () => {
    conversationService.deleteConversation.mockResolvedValue(true);
    const res = await chatService.deleteConversation('1');
    expect(res).toBe(true);
  });

  it('debe limpiar todas las conversaciones', async () => {
    conversationService.clearAllConversations.mockResolvedValue();
    await expect(chatService.clearAllConversations()).resolves.toBeUndefined();
  });

  it('debe actualizar el título de una conversación', async () => {
    conversationService.updateConversationTitle.mockResolvedValue(true);
    const res = await chatService.updateConversationTitle('1', 'Nuevo título');
    expect(res).toBe(true);
  });

  it('debe buscar conversaciones', async () => {
    conversationService.searchConversations.mockResolvedValue([mockConversation]);
    const res = await chatService.searchConversations('test');
    expect(res.length).toBe(1);
  });

  it('debe obtener estadísticas', async () => {
    conversationService.getStats.mockResolvedValue({
      totalConversations: 1,
      totalMessages: 2,
      averageMessagesPerConversation: 2,
    });
    const stats = await chatService.getStats();
    expect(stats.totalConversations).toBe(1);
  });

  it('debe verificar si el servicio está configurado', () => {
    mistralService.isConfigured.mockReturnValue(true);
    expect(chatService.isHealthy()).toBe(true);
  });
});
