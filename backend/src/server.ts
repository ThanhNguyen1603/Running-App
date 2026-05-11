import './config/env'; // validate env vars first
import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { logger } from './utils/logger';

async function main() {
  // Verify DB connection on startup
  await prisma.$connect();
  logger.info('Database connected');

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
