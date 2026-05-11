import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as ctrl from '../controllers/activities.controller';

const router = Router();

router.post('/sync', requireAuth, asyncHandler(ctrl.syncActivities));
router.get('/', requireAuth, asyncHandler(ctrl.getActivities));

export default router;
