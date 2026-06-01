import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { getCorsOrigins } from './config/env.js';
import { healthRoutes } from './routes/health.js';
import { catalogRoutes } from './routes/catalog.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, {
    origin: getCorsOrigins(),
    credentials: true,
  });

  await app.register(healthRoutes);
  await app.register(catalogRoutes);

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      error: 'internal_error',
      message:
        statusCode >= 500
          ? 'Terjadi kesalahan pada server'
          : error.message,
    });
  });

  return app;
}
