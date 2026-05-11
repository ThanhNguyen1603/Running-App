import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import stravaRoutes from './routes/strava.routes';
import activitiesRoutes from './routes/activities.routes';
import challengesRoutes from './routes/challenges.routes';
import groupsRoutes from './routes/groups.routes';
import usersRoutes from './routes/users.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global rate limit
app.use(globalLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/strava', stravaRoutes);
app.use('/activities', activitiesRoutes);
app.use('/challenges', challengesRoutes);
app.use('/groups', groupsRoutes);
app.use('/users', usersRoutes);
app.use('/webhook', webhookRoutes);

// 404 & error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
