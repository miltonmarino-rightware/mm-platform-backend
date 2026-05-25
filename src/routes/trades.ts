
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { tradeSchema, updateTradeSchema } from '../schemas/trade.js';
import { AppError } from '../errors/AppError.js';

export const tradeRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/trades
  app.get('/trades', async (request) => {
    const { data: trades, error } = await supabase
      .from('trading_journal')
      .select('*')
      .eq('user_id', request.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return trades;
  });

  // POST /api/trades
  app.post('/trades', async (request) => {
    const body = tradeSchema.parse(request.body);
    
    const { data: trade, error } = await supabase
      .from('trading_journal')
      .insert({ ...body, user_id: request.user!.id })
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return trade;
  });

  // GET /api/trades/:id
  app.get('/trades/:id', async (request: any) => {
    const { id } = request.params;
    const { data: trade, error } = await supabase
      .from('trading_journal')
      .select('*')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single();

    if (error || !trade) throw new AppError('NOT_FOUND', 404, 'Trade not found');
    return trade;
  });

  // PUT /api/trades/:id
  app.put('/trades/:id', async (request: any) => {
    const { id } = request.params;
    const body = updateTradeSchema.parse(request.body);

    const { data: trade, error } = await supabase
      .from('trading_journal')
      .update(body)
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return trade;
  });

  // DELETE /api/trades/:id
  app.delete('/trades/:id', async (request: any) => {
    const { id } = request.params;
    const { error } = await supabase
      .from('trading_journal')
      .delete()
      .eq('id', id)
      .eq('user_id', request.user!.id);

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return { success: true };
  });

  // GET /api/trades/stats
  app.get('/trades/stats', async (request) => {
    const { data: trades, error } = await supabase
      .from('trading_journal')
      .select('pips, profit, status')
      .eq('user_id', request.user!.id);

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);

    const stats = trades.reduce((acc, trade) => {
      acc.totalTrades++;
      if (trade.status === 'CLOSED') {
        if ((trade.profit || 0) > 0) acc.wins++;
        else if ((trade.profit || 0) < 0) acc.losses++;
        acc.totalPips += (trade.pips || 0);
        acc.totalProfit += (trade.profit || 0);
      }
      return acc;
    }, { totalTrades: 0, wins: 0, losses: 0, totalPips: 0, totalProfit: 0 });

    const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0;

    return { ...stats, winRate };
  });
};
