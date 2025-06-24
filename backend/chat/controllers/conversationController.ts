import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { ChatValidators } from '../utils/validators';

/**
 * Controlador para operaciones relacionadas con conversaciones
 */
export class ConversationController {
  /**
   * Obtiene una conversación específica por ID
   */
  static async getConversationById(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      const validation = ChatValidators.validateConversationId(conversationId);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const conversation = await chatService.getConversation(conversationId);

      if (!conversation) {
        return res.status(404).json({
          error: 'Conversación no encontrada',
          code: 'CONVERSATION_NOT_FOUND',
        });
      }

      res.status(200).json(conversation);
    } catch (error: any) {
      console.error('Error en ConversationController.getConversationById:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Obtiene todas las conversaciones con paginación
   */
  static async getConversations(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const validation = ChatValidators.validatePagination(page, limit);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await chatService.getAllConversations(page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error en ConversationController.getConversations:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Elimina una conversación
   */
  static async deleteConversationById(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      const validation = ChatValidators.validateConversationId(conversationId);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const deleted = await chatService.deleteConversation(conversationId);

      if (!deleted) {
        return res.status(404).json({
          error: 'Conversación no encontrada',
          code: 'CONVERSATION_NOT_FOUND',
        });
      }

      res.status(200).json({
        message: 'Conversación eliminada exitosamente',
        conversationId,
      });
    } catch (error: any) {
      console.error('Error en ConversationController.deleteConversationById:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Actualiza el título de una conversación
   */
  static async updateConversationTitle(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { title } = req.body;

      const conversationValidation = ChatValidators.validateConversationId(conversationId);
      if (!conversationValidation.isValid) {
        return res.status(400).json({
          error: conversationValidation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const titleValidation = ChatValidators.validateTitle(title);
      if (!titleValidation.isValid) {
        return res.status(400).json({
          error: titleValidation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const updated = await chatService.updateConversationTitle(conversationId, title.trim());

      if (!updated) {
        return res.status(404).json({
          error: 'Conversación no encontrada',
          code: 'CONVERSATION_NOT_FOUND',
        });
      }

      res.status(200).json({
        message: 'Título actualizado exitosamente',
        conversationId,
        newTitle: title.trim(),
      });
    } catch (error: any) {
      console.error('Error en ConversationController.updateConversationTitle:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Limpia todas las conversaciones
   */
  static async clearAllConversations(req: Request, res: Response) {
    try {
      await chatService.clearAllConversations();
      res.status(200).json({
        message: 'Todas las conversaciones han sido eliminadas',
      });
    } catch (error: any) {
      console.error('Error en ConversationController.clearAllConversations:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }
}
