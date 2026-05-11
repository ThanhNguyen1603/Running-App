import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as ctrl from '../controllers/groups.controller';

const router = Router();

router.post('/', requireAuth, requireAdmin, asyncHandler(ctrl.createGroup));
router.get('/', requireAuth, asyncHandler(ctrl.getMyGroups));
router.get('/:id', requireAuth, asyncHandler(ctrl.getGroupById));
router.post('/:id/join', requireAuth, asyncHandler(ctrl.joinGroup));
router.get('/:id/leaderboard', requireAuth, asyncHandler(ctrl.getLeaderboard));

export default router;
