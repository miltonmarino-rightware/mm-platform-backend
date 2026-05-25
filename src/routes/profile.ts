
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { updateProfileSchema } from '../schemas/profile.js';
import { AppError } from '../errors/AppError.js';

export const profileRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // POST /api/auth/me
  app.post('/auth/me', async (request) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', request.user!.id)
      .single();

    if (error || !profile) {
      throw new AppError('NOT_FOUND', 404, 'Profile not found');
    }

    return { user: request.user, profile };
  });

  // GET /api/profile
  app.get('/profile', async (request) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', request.user!.id)
      .single();

    if (error || !profile) {
      throw new AppError('NOT_FOUND', 404, 'Profile not found');
    }

    return profile;
  });

  // PUT /api/profile
  app.put('/profile', async (request) => {
    const body = updateProfileSchema.parse(request.body);

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', request.user!.id)
      .select()
      .single();

    if (error) {
      throw new AppError('DATABASE_ERROR', 500, error.message);
    }

    return profile;
  });
};
