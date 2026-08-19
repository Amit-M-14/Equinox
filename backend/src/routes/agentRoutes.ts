import { Router } from 'express';
import { triggerAgent } from '../controllers/agentController.js';

const router = Router();

router.post('/run', triggerAgent);

export default router;