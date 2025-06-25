import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { ChatValidators } from '../utils/chatValidators';
import { ChatRequest } from '../../types';

/**
 * Controlador para operaciones relacionadas con mensajes del chat.
 * Contiene métodos estáticos para interactuar con el servicio de chat.
 */
export class MessageController {
  /**
   * Maneja el envío de un mensaje al servicio de chat.
   * Valida el contenido del mensaje y delega el procesamiento al chatService.
   *
   * @param req - Objeto Request de Express con el cuerpo del mensaje (ChatRequest).
   * @param res - Objeto Response de Express utilizado para devolver la respuesta.
   * @returns Devuelve un JSON con la respuesta del servicio de chat o un error en caso de fallo.
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const chatRequest: ChatRequest = req.body;

      // Validar la solicitud
      const validation = ChatValidators.validateChatRequest(chatRequest);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_ERROR',
        });
      }

      const response = await chatService.sendMessage(chatRequest);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error en MessageController.sendMessage:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        code: 'CHAT_ERROR',
      });
    }
  }
}
