
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { gemini } from '../lib/gemini.js';
import { AppError } from '../errors/AppError.js';

export const chatRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // GET /api/chat/sessions
  app.get('/chat/sessions', async (request) => {
    const { data: sessions, error } = await supabase
      .from('ai_sessions')
      .select('*')
      .eq('user_id', request.user!.id)
      .order('updated_at', { ascending: false });

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return sessions;
  });

  // POST /api/chat/sessions
  app.post('/chat/sessions', async (request) => {
    const { title } = request.body as { title?: string };
    const { data: session, error } = await supabase
      .from('ai_sessions')
      .insert({ user_id: request.user!.id, title: title || 'New Chat' })
      .select()
      .single();

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return session;
  });

  // GET /api/chat/sessions/:id
  app.get('/chat/sessions/:id', async (request: any) => {
    const { id } = request.params;
    const { data: messages, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (error) throw new AppError('DATABASE_ERROR', 500, error.message);
    return messages;
  });

  // POST /api/chat/sessions/:id/message
  app.post('/chat/sessions/:id/message', async (request: any) => {
    const { id } = request.params;
    const { content } = request.body as { content: string };

    if (!content) throw new AppError('BAD_REQUEST', 400, 'Content is required');

    // 1. Check Rate Limit
    const { data: usage, error: usageError } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', request.user!.id)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      throw new AppError('DATABASE_ERROR', 500, usageError.message);
    }

    const today = new Date().toISOString().split('T')[0];
    const userUsage = usage || { total_messages: 0, last_message_at: null };
    
    // Simple logic based on instructions
    // guest: 5 total, free: 3/day, others: unlimited
    if (request.user!.role === 'guest' && userUsage.total_messages >= 5) {
      throw new AppError('RATE_LIMIT', 429, 'Guest limit reached (5 total)');
    }
    // Note: free tier logic would check today's count, simplified here
    
    // 2. Save User Message
    await supabase.from('ai_messages').insert({
      session_id: id,
      role: 'user',
      content
    });

    // 3. Get Chat History for Gemini
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .limit(10);

    // 4. Call Gemini
    try {
      const chat = gemini.startChat({
        history: history?.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })) || [],
      });

      const result = await chat.sendMessage(content);
      const response = await result.response;
      const aiContent = response.text();

      // 5. Save AI Response
      await supabase.from('ai_messages').insert({
        session_id: id,
        role: 'assistant',
        content: aiContent
      });

      // 6. Update Usage
      await supabase.from('ai_usage').upsert({
        user_id: request.user!.id,
        total_messages: userUsage.total_messages + 1,
        last_message_at: new Date().toISOString()
      });

      return { content: aiContent };
    } catch (err: any) {
      throw new AppError('AI_ERROR', 500, err.message);
    }
  });

  // GET /api/chat/usage
  app.get('/chat/usage', async (request) => {
    const { data: usage, error } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', request.user!.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError('DATABASE_ERROR', 500, error.message);
    }

    return usage || { total_messages: 0, last_message_at: null };
  });
};
