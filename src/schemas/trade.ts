
import { z } from 'zod';

export const tradeSchema = z.object({
  pair: z.string().min(1),
  type: z.enum(['BUY', 'SELL']),
  entry_price: z.number(),
  exit_price: z.number().optional(),
  stop_loss: z.number().optional(),
  take_profit: z.number().optional(),
  size: z.number().optional(),
  pips: z.number().optional(),
  profit: z.number().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED']).default('OPEN'),
  notes: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const updateTradeSchema = tradeSchema.partial();

export type TradeInput = z.infer<typeof tradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
