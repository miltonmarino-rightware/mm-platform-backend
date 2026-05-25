
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../errors/AppError.js';

export const socialRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/groups
  app.get('/groups', async (request) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', request.user!.id);
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // GET /api/groups/:id/messages
  app.get('/groups/:id/messages', async (request: any) => {
    const { id } = request.params;
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('group_id', id)
      .order('created_at', { ascending: true });
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // POST /api/groups/:id/messages
  app.post('/groups/:id/messages', async (request: any) => {
    const { id } = request.params;
    const { content } = request.body as { content: string };
    const { data, error } = await supabase
      .from('messages')
      .insert({ group_id: id, content, sender_id: request.user!.id })
      .select()
      .single();
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // GET /api/messages
  app.get('/messages', async (request) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${request.user!.id},receiver_id.eq.${request.user!.id}`)
      .is('group_id', null)
      .order('created_at', { ascending: false });
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });
};
