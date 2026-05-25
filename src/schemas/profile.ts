
import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().length(2).optional(),
  phone: z.string().min(5).optional(),
  avatar_url: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
