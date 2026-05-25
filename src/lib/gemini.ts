
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const gemini = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: "Tu és o MM AI, mentor de trading da Money Makers Academy. Falas português europeu. Sem hype, sem promessas de lucros. Foca em psicologia, gestão de risco, disciplina."
});
