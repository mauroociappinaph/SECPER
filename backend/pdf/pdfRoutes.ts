import { Router } from 'express';

import multer from 'multer';
import { readPdfController } from './pdfController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/read', upload.single('archivo'), readPdfController);

export default router;
