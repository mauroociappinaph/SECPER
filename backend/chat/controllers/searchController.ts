import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { ChatValidators } from '../utils/chatValidators';

/**
 * Controlador para operaciones de búsqueda y estadísticas
 */
export class SearchController {
  /**
   * Busca en conversaciones por texto
   */
  static async searchConversations(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (typeof query !== 'string') {
        return res.status(400).json({
          error: 'Parámetro de búsqueda debe ser una cadena de texto',
          code: 'VALIDATION_ERROR',
        });
      }

      const validation = ChatValidators.validateSearchQuery(query);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const results = await chatService.searchConversations(query.trim());
      res.status(200).json({
        query: query.trim(),
        results,
        count: results.length,
      });
    } catch (error: any) {
      console.error('Error en SearchController.searchConversations:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Obtiene estadísticas del chat
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await chatService.getStats();
      res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error en SearchController.getStats:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Verifica el estado del módulo de chat
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const stats = await chatService.getStats();
      const isHealthy = chatService.isHealthy();

      res.status(200).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        module: 'chat',
        mistralConfigured: isHealthy,
        timestamp: new Date().toISOString(),
        stats,
      });
    } catch (error: any) {
      console.error('Error en SearchController.healthCheck:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: error.message || 'Error interno del servidor',
        code: 'SERVER_ERROR',
      });
    }
  }
}
