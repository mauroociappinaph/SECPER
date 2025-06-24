import { Router } from 'express';
import calendarRoutes from '../calender/callendersRoutes';
import pdfRoutes from '../pdf/pdfRoutes';

const router = Router();

// Rutas de calendario
router.use('/api/calendario', calendarRoutes);
// Rutas de PDF
router.use('/api/pdf', pdfRoutes);

export default router;
