import { Router } from 'express';
import * as ctrl from '../controllers/webhook.controller';

const router = Router();

router.get('/strava', ctrl.stravaWebhookValidation);
router.post('/strava', ctrl.stravaWebhookEvent);

export default router;
