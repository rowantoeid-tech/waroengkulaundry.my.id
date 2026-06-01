import type { FastifyPluginAsync } from 'fastify';
import { checkDatabase } from '../lib/prisma.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  const handler = async () => {
    const database = await checkDatabase();
    return {
      status: 'ok',
      service: 'waroengku-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      database,
    };
  };

  app.get('/health', handler);
  app.get('/api/health', handler);
};
