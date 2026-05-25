
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../errors/AppError.js';

export const broadcastRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/broadcasts
  app.get('/broadcasts', async (request) => {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // POST /api/broadcasts/:id/read
  app.post('/broadcasts/:id/read', async (request: any) => {
    const { id } = request.params;
    const { error } = await supabase
      .from('broadcast_reads')
      .upsert({ broadcast_id: id, user_id: request.user!.id });
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return { success: true };
  });

  // Admin Routes
  app.post('/admin/broadcasts', { preHandler: [requireRole('mentor')] }, async (request) => {
    const { data, error } = await supabase.from('broadcasts').insert(request.body as any).select().single();
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });
};
