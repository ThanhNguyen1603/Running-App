import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as ctrl from '../controllers/challenges.controller';

const router = Router();

router.post('/', requireAuth, requireAdmin, asyncHandler(ctrl.createChallenge));
router.get('/', requireAuth, asyncHandler(ctrl.getChallenges));
router.get('/:id', requireAuth, asyncHandler(ctrl.getChallengeById));

export default router;
