
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../errors/AppError.js';

export const bookingRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/bookings/slots
  app.get('/bookings/slots', async () => {
    const { data, error } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('is_available', true);
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // GET /api/bookings
  app.get('/bookings', async (request) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, booking_slots(*)')
      .eq('user_id', request.user!.id);
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // POST /api/bookings
  app.post('/bookings', async (request) => {
    const { slot_id, topic } = request.body as { slot_id: string; topic: string };
    const { data, error } = await supabase
      .from('bookings')
      .insert({ slot_id, topic, user_id: request.user!.id, status: 'reserved' })
      .select()
      .single();
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // DELETE /api/bookings/:id
  app.delete('/bookings/:id', async (request: any) => {
    const { id } = request.params;
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .eq('status', 'reserved');
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return { success: true };
  });

  // Admin Routes
  app.post('/admin/booking-slots', { preHandler: [requireRole('admin')] }, async (request) => {
    const { data, error } = await supabase.from('booking_slots').insert(request.body as any).select().single();
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  app.get('/admin/bookings', { preHandler: [requireRole('admin')] }, async () => {
    const { data, error } = await supabase.from('bookings').select('*, profiles(*), booking_slots(*)');
    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });
};
