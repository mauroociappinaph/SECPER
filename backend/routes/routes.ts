import { Router } from 'express';
import calendarRoutes from '../calender/callendersRoutes';
import pdfRoutes from '../pdf/pdfRoutes';
import chatRoutes from '../chat/chatRoutes';

const router = Router();

// Rutas de calendario
router.use('/api/calendario', calendarRoutes);
// Rutas de PDF
router.use('/api/pdf', pdfRoutes);
// Rutas de chat
router.use('/api/chat', chatRoutes);

export default router;
