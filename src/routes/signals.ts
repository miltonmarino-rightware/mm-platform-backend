
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../lib/supabase.js';
import { signalSchema, updateSignalSchema } from '../schemas/signal.js';
import { AppError } from '../errors/AppError.js';

export const signalRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/signals
  app.get('/signals', async (request) => {
    // Check subscription logic would go here
    // For now, only signals_member, mentor, admin, super_admin see signals
    const allowedRoles = ['signals_member', 'mentor', 'admin', 'super_admin'];
    if (!allowedRoles.includes(request.user!.role)) {
      return [];
    }

    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return signals;
  });

  // GET /api/signals/:id
  app.get('/signals/:id', async (request: any) => {
    const { id } = request.params;
    const { data: signal, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !signal) throw new AppError('NOT_FOUND', 404, 'Signal not found');
    return signal;
  });

  // POST /api/signals/:id/read
  app.post('/signals/:id/read', async (request: any) => {
    const { id } = request.params;
    const { error } = await supabase
      .from('signal_reads')
      .upsert({ signal_id: id, user_id: request.user!.id });

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return { success: true };
  });

  // Admin/Mentor Routes
  app.post('/admin/signals', { preHandler: [requireRole('mentor')] }, async (request) => {
    const body = signalSchema.parse(request.body);
    const { data: signal, error } = await supabase
      .from('signals')
      .insert({ ...body, created_by: request.user!.id })
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return signal;
  });

  app.put('/admin/signals/:id', { preHandler: [requireRole('mentor')] }, async (request: any) => {
    const { id } = request.params;
    const body = updateSignalSchema.parse(request.body);
    const { data: signal, error } = await supabase
      .from('signals')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return signal;
  });

  app.patch('/admin/signals/:id/state', { preHandler: [requireRole('mentor')] }, async (request: any) => {
    const { id } = request.params;
    const { state } = request.body as { state: string };
    
    if (!['PUBLISHED', 'CLOSED', 'CANCELLED'].includes(state)) {
      throw new AppError('BAD_REQUEST', 400, 'Invalid state');
    }

    const { data: signal, error } = await supabase
      .from('signals')
      .update({ status: state })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return signal;
  });

  app.delete('/admin/signals/:id', { preHandler: [requireRole('mentor')] }, async (request: any) => {
    const { id } = request.params;
    
    // Check if it's a draft
    const { data: existing } = await supabase
      .from('signals')
      .select('status')
      .eq('id', id)
      .single();

    if (!existing || existing.status !== 'DRAFT') {
      throw new AppError('FORBIDDEN', 403, 'Only draft signals can be deleted');
    }

    const { error } = await supabase
      .from('signals')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return { success: true };
  });
};
