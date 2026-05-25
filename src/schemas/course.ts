
import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  required_subscription: z.string().optional(),
});

export const moduleSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  order: z.number().int().min(0),
});

export const lessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().optional(),
  video_url: z.string().url().optional(),
  order: z.number().int().min(0),
});

export const progressSchema = z.object({
  lesson_id: z.string().uuid(),
  completed: z.boolean().default(true),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
