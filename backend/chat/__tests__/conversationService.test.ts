import { ConversationService } from '../services/conversationService';
import { prisma } from '../../database/prisma';
import { ChatMessage } from '../../types';

jest.mock('../../database/prisma', () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    message: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
    jest.clearAllMocks();
  });

  it('debe crear una nueva conversación si no existe', async () => {
    (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conversation.create as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Nueva Conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    });
    const conv = await service.getOrCreateConversation();
    expect(conv).toHaveProperty('id', '1');
    expect(prisma.conversation.create).toHaveBeenCalled();
  });

  it('debe obtener una conversación existente', async () => {
    (prisma.conversation.findUnique as jest.Mock).mockResolvedValue({
      id: '2',
      title: 'Test',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    });
    const conv = await service.getOrCreateConversation('2');
    expect(conv).toHaveProperty('id', '2');
    expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
      where: { id: '2' },
      include: { messages: true },
    });
  });

  it('debe agregar un mensaje a una conversación', async () => {
    (prisma.conversation.findUnique as jest.Mock).mockResolvedValue({
      id: '3',
      title: 'Test',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    });
    (prisma.message.create as jest.Mock).mockResolvedValue({
      id: 'm1',
      role: 'user',
      content: 'Hola',
      timestamp: new Date(),
      conversationId: '3',
    });
    (prisma.conversation.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '3',
      title: 'Test',
      messages: [
        { id: 'm1', role: 'user', content: 'Hola', timestamp: new Date(), conversationId: '3' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    });
    const msg: ChatMessage = {
      id: 'm1',
      role: 'user',
      content: 'Hola',
      timestamp: new Date(),
      conversationId: '3',
    };
    const conv = await service.addMessageToConversation('3', msg);
    expect(conv.messages.length).toBeGreaterThan(0);
    expect(prisma.message.create).toHaveBeenCalled();
  });

  it('debe eliminar una conversación', async () => {
    (prisma.conversation.delete as jest.Mock).mockResolvedValue({});
    const result = await service.deleteConversation('4');
    expect(result).toBe(true);
    expect(prisma.conversation.delete).toHaveBeenCalledWith({ where: { id: '4' } });
  });

  it('debe actualizar el título de una conversación', async () => {
    (prisma.conversation.update as jest.Mock).mockResolvedValue({
      id: '5',
      title: 'Nuevo Título',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    });
    const result = await service.updateConversationTitle('5', 'Nuevo Título');
    expect(result).toBe(true);
    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: '5' },
      data: { title: 'Nuevo Título', updatedAt: expect.any(Date) },
    });
  });

  it('debe limpiar todas las conversaciones', async () => {
    (prisma.message.deleteMany as jest.Mock).mockResolvedValue({});
    (prisma.conversation.deleteMany as jest.Mock).mockResolvedValue({});
    await service.clearAllConversations();
    expect(prisma.message.deleteMany).toHaveBeenCalled();
    expect(prisma.conversation.deleteMany).toHaveBeenCalled();
  });
});
