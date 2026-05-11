import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as ctrl from '../controllers/users.controller';

const router = Router();

router.get('/me', requireAuth, asyncHandler(ctrl.getMe));
router.patch('/me', requireAuth, asyncHandler(ctrl.updateMe));

export default router;
