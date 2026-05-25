
import { z } from 'zod';

export const signalSchema = z.object({
  pair: z.string().min(1),
  type: z.enum(['BUY', 'SELL']),
  entry_price: z.number(),
  stop_loss: z.number(),
  take_profit_1: z.number(),
  take_profit_2: z.number().optional(),
  take_profit_3: z.number().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']).default('DRAFT'),
  notes: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const updateSignalSchema = signalSchema.partial();

export type SignalInput = z.infer<typeof signalSchema>;
export type UpdateSignalInput = z.infer<typeof updateSignalSchema>;
