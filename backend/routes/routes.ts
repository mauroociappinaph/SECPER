import { Router } from 'express';
import calendarRoutes from '../calendar/calendarRoutes';
import pdfRoutes from '../pdf/pdfRoutes';
import chatRoutes from '../chat/chatRoutes';
import driveRoutes from '../google-drive/driveRoutes';

const router = Router();

// Rutas de calendario
router.use('/api/calendario', calendarRoutes);
// Rutas de PDF
router.use('/api/pdf', pdfRoutes);
// Rutas de chat
router.use('/api/chat', chatRoutes);
// Rutas de Google Drive
router.use('/api/drive', driveRoutes);

export default router;
