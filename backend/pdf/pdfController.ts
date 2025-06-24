import { Request, Response } from 'express';
import { MulterRequest } from '../types/multer.interfaces';
import {  analyzePdfWithMistral } from './pdfService';

/**
 * Controlador para procesar un archivo PDF subido mediante una solicitud HTTP.
 *
 * Este controlador verifica si se ha enviado un archivo PDF, y si está presente,
 * lo analiza utilizando el servicio `analyzePdfWithMistral`. Devuelve el resultado
 * del análisis en formato JSON. Si no se envía archivo o hay un error durante el
 * procesamiento, devuelve el error correspondiente.
 *
 * @param {Request} req - La solicitud HTTP entrante, que debe contener un archivo PDF en `req.file`.
 * @param {Response} res - El objeto de respuesta HTTP.
 */
export const readPdfController = async (req: Request, res: Response) => {
  try {
    const mReq = req as MulterRequest;
    if (!mReq.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo PDF.' });
    }
    const mistralResult = await analyzePdfWithMistral(mReq.file.buffer);
    res.json({ resultado: mistralResult });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al leer el PDF.' });
  }
};
