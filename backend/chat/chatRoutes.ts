import { Router } from 'express';
import { MessageController } from './controllers/messageController';
import { ConversationController } from './controllers/conversationController';
import { SearchController } from './controllers/searchController';

const router = Router();

// ==================== RUTAS PRINCIPALES ====================

/**
 * POST /api/chat/message
 * Envía un mensaje al chat y obtiene respuesta de Mistral
 * Body: { message: string, conversationId?: string, systemPrompt?: string, model?: string, temperature?: number, maxTokens?: number }
 */
router.post('/message', MessageController.sendMessage);

/**
 * GET /api/chat/conversations
 * Obtiene todas las conversaciones con paginación
 * Query params: ?page=1&limit=20
 */
router.get('/conversations', ConversationController.getConversations);

/**
 * GET /api/chat/conversations/:conversationId
 * Obtiene una conversación específica por ID
 */
router.get('/conversations/:conversationId', ConversationController.getConversationById);

/**
 * DELETE /api/chat/conversations/:conversationId
 * Elimina una conversación específica
 */
router.delete('/conversations/:conversationId', ConversationController.deleteConversationById);

/**
 * PUT /api/chat/conversations/:conversationId/title
 * Actualiza el título de una conversación
 * Body: { title: string }
 */
router.put('/conversations/:conversationId/title', ConversationController.updateConversationTitle);

// ==================== RUTAS DE GESTIÓN ====================

/**
 * DELETE /api/chat/conversations
 * Elimina todas las conversaciones (usar con cuidado)
 */
router.delete('/conversations', ConversationController.clearAllConversations);

/**
 * GET /api/chat/search
 * Busca en conversaciones por texto
 * Query params: ?query=texto_a_buscar
 */
router.get('/search', SearchController.searchConversations);

/**
 * GET /api/chat/stats
 * Obtiene estadísticas del chat
 */
router.get('/stats', SearchController.getStats);

/**
 * GET /api/chat/health
 * Verifica el estado del módulo de chat
 */
router.get('/health', SearchController.healthCheck);

export default router;