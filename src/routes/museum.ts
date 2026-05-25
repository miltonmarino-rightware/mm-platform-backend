
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../errors/AppError.js';

export const museumRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/museum
  app.get('/museum', async () => {
    const { data, error } = await supabase.from('museum_entries').select('*');
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // GET /api/events
  app.get('/events', async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // POST /api/events/:id/join
  app.post('/events/:id/join', async (request: any) => {
    const { id } = request.params;
    const { error } = await supabase.from('event_participants').upsert({ event_id: id, user_id: request.user!.id });
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return { success: true };
  });

  // Admin Routes
  app.post('/admin/museum', { preHandler: [requireRole('mentor')] }, async (request) => {
    const { data, error } = await supabase.from('museum_entries').insert(request.body as any).select().single();
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });
};
