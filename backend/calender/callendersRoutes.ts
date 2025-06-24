import { Router } from 'express';
import { creatEvent } from './calenderControllers';

const router = Router();

router.post('/evento', creatEvent);

export default router;
