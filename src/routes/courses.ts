
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../lib/supabase.js';
import { courseSchema, moduleSchema, progressSchema } from '../schemas/course.js';
import { AppError } from '../errors/AppError.js';

export const courseRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/courses
  app.get('/courses', async (request) => {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'PUBLISHED');

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return courses;
  });

  // GET /api/courses/:id
  app.get('/courses/:id', async (request: any) => {
    const { id } = request.params;
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !course) throw new AppError('NOT_FOUND', 404, 'Course not found');
    return course;
  });

  // GET /api/courses/:id/modules
  app.get('/courses/:id/modules', async (request: any) => {
    const { id } = request.params;
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', id)
      .order('order', { ascending: true });

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return modules;
  });

  // GET /api/courses/:id/progress
  app.get('/courses/:id/progress', async (request: any) => {
    const { id } = request.params;
    const { data: progress, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', request.user!.id)
      .eq('course_id', id);

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return progress;
  });

  // POST /api/courses/:id/progress
  app.post('/courses/:id/progress', async (request: any) => {
    const { id } = request.params;
    const body = progressSchema.parse(request.body);

    const { data, error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: request.user!.id,
        course_id: id,
        lesson_id: body.lesson_id,
        completed: body.completed,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  // Admin/Mentor Routes
  app.post('/admin/courses', { preHandler: [requireRole('mentor')] }, async (request) => {
    const body = courseSchema.parse(request.body);
    const { data, error } = await supabase
      .from('courses')
      .insert(body)
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });

  app.post('/admin/courses/:id/modules', { preHandler: [requireRole('mentor')] }, async (request: any) => {
    const { id } = request.params;
    const body = moduleSchema.parse({ ...request.body, course_id: id });
    const { data, error } = await supabase
      .from('modules')
      .insert(body)
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return data;
  });
};
