import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { ChatValidators } from '../utils/validators';
import { ChatRequest } from '../../types';

/**
 * Controlador para operaciones relacionadas con mensajes
 */
export class MessageController {
  
  /**
   * Envía un mensaje al chat
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const chatRequest: ChatRequest = req.body;
      
      // Validar la solicitud
      const validation = ChatValidators.validateChatRequest(chatRequest);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: validation.error,
          code: 'VALIDATION_ERROR'
        });
      }

      const response = await chatService.sendMessage(chatRequest);
      res.status(200).json(response);

    } catch (error: any) {
      console.error('Error en MessageController.sendMessage:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor',
        code: 'CHAT_ERROR'
      });
    }
  }
}