import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as ctrl from '../controllers/strava.controller';

const router = Router();

router.get('/connect', requireAuth, asyncHandler(ctrl.connectStrava));
router.get('/callback', asyncHandler(ctrl.stravaCallback));
router.delete('/disconnect', requireAuth, asyncHandler(ctrl.disconnectStrava));
router.get('/status', requireAuth, asyncHandler(ctrl.stravaStatus));

export default router;
