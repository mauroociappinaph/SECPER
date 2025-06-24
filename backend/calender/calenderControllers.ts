import { Request, Response } from 'express';
import { createCalendarEvent } from './calenderService';

export const creatEvent = async (req: Request, res: Response) => {
  try {
    const resultado = await createCalendarEvent(req.body);
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al crear el evento' });
  }
};
