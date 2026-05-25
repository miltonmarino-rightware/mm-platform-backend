
import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../errors/AppError.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      role: string;
    };
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 401, 'Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError('UNAUTHORIZED', 401, 'Invalid or expired token');
  }

  // Get user profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AppError('INTERNAL_ERROR', 500, 'User profile not found');
  }

  request.user = {
    id: user.id,
    email: user.email,
    role: profile.role,
  };
};
