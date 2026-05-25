
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { profileRoutes } from './routes/profile.js';
import { tradeRoutes } from './routes/trades.js';
import { signalRoutes } from './routes/signals.js';
import { chatRoutes } from './routes/chat.js';
import { courseRoutes } from './routes/courses.js';
import { bookingRoutes } from './routes/bookings.js';
import { broadcastRoutes } from './routes/broadcasts.js';
import { socialRoutes } from './routes/social.js';
import { museumRoutes } from './routes/museum.js';
import { paymentRoutes } from './routes/payments.js';
import { AppError } from './errors/AppError.js';
import { supabase } from './lib/supabase.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
      },
    },
  });

  // Plugins
  await app.register(helmet);
  await app.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(','),
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Middlewares
  app.addHook('onRequest', requestIdMiddleware);

  // Error Handler
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
        details: error.details,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  });

  // Routes
  app.get('/health', async () => {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return { 
      status: 'ok', 
      supabase: error ? 'error' : 'ok',
      timestamp: new Date().toISOString()
    };
  });

  app.get('/api/version', async () => {
    return { version: '0.1.0' };
  });

  // Register Routes
  await app.register(profileRoutes, { prefix: '/api' });
  await app.register(tradeRoutes, { prefix: '/api' });
  await app.register(signalRoutes, { prefix: '/api' });
  await app.register(chatRoutes, { prefix: '/api' });
  await app.register(courseRoutes, { prefix: '/api' });
  await app.register(bookingRoutes, { prefix: '/api' });
  await app.register(broadcastRoutes, { prefix: '/api' });
  await app.register(socialRoutes, { prefix: '/api' });
  await app.register(museumRoutes, { prefix: '/api' });
  await app.register(paymentRoutes, { prefix: '/api' });

  return app;
};
