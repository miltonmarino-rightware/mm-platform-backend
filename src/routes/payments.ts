
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../errors/AppError.js';

export const paymentRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // POST /api/payments/checkout (STUB)
  app.post('/payments/checkout', async (request) => {
    const { plan } = request.body as { plan: string };
    
    // Stub: generate a payment record (status: pending)
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: request.user!.id,
        plan_id: plan,
        amount: 0, // Should be from plan
        status: 'pending',
        provider: 'stub'
      })
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    
    return { 
      checkout_url: 'https://payment-stub.example.com',
      payment_id: data.id
    };
  });
};
