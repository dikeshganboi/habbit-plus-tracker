// New Gemini service using @google/genai SDK
// Provides generateHabitSuggestionsNew with graceful fallbacks and structured errors

import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const requestedModel = import.meta.env.VITE_GEMINI_MODEL?.trim();
// Preferred model order (omit preview models unless explicitly set)
const MODEL_CHAIN = [requestedModel, 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(Boolean);

function ensureClient() {
  if (!apiKey) throw new Error('Missing API key. Set VITE_GEMINI_API_KEY in .env and restart.');
  return new GoogleGenAI({ apiKey });
}

function buildPrompt(persona, existingHabits) {
  const existingText = existingHabits?.length
    ? `\n\nExisting habits (avoid duplicates):\n${existingHabits.map(h => `- ${h.title}`).join('\n')}`
    : '';
  return `You are a habit formation and behavior design expert. Based on the persona below, generate exactly 5 DAILY habit suggestions.

Persona: "${persona}"${existingText}

Rules:
1. Each habit must be actionable and specific
2. Provide a realistic monthly goal (15-30 days in a 30-day month)
3. Avoid duplicates of existing habits
4. Cover varied domains (health, productivity, learning, mindfulness, growth)
5. JSON only – no commentary, no markdown

Return format strictly:
[
  {"title": "Habit name", "goal": 26},
  {"title": "Habit name", "goal": 24},
  {"title": "Habit name", "goal": 30},
  {"title": "Habit name", "goal": 20},
  {"title": "Habit name", "goal": 28}
]`;
}

function parseJson(raw) {
  let text = (raw || '').trim();
  if (!text) throw new Error('Empty AI response');
  // Strip code fences if any
  if (text.startsWith('```')) text = text.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim();
  const data = JSON.parse(text);
  if (!Array.isArray(data) || data.length === 0) throw new Error('Response not an array');
  return data.slice(0, 5).map(item => ({
    title: (item.title || '').trim() || 'Untitled Habit',
    goal: Math.min(Math.max(parseInt(item.goal) || 25, 15), 30)
  }));
}

export async function generateHabitSuggestionsNew(persona, existingHabits = []) {
  if (!persona?.trim()) throw new Error('Provide a persona description first.');
  const client = ensureClient();
  const prompt = buildPrompt(persona.trim(), existingHabits);
  let lastError;
  for (const model of MODEL_CHAIN) {
    try {
      console.log('[GenAI] Trying model:', model);
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 700
        }
      });
      // New SDK may expose text directly or via candidates
      const rawText = response.text || response.outputText || response.candidates?.[0]?.content?.parts?.[0]?.text;
      const habits = parseJson(rawText);
      console.log('[GenAI] Success with model:', model);
      return habits;
    } catch (err) {
      lastError = err;
      const msg = err?.message || String(err);
      if (/404|not found/i.test(msg)) {
        console.warn(`[GenAI] Model ${model} not found. Trying next.`);
        continue;
      }
      if (/permission|403|unauthorized/i.test(msg)) {
        throw new Error('Permission denied. Enable Generative Language API for this key in Google Cloud console.');
      }
      if (/quota|rate|429/i.test(msg)) {
        throw new Error('Rate limit or quota exceeded. Wait and retry.');
      }
      if (/invalid|key/i.test(msg)) {
        throw new Error('Invalid API key or not authorized for chosen model. Regenerate key or use a supported model.');
      }
      console.warn(`[GenAI] Non-fatal error on model ${model}: ${msg}`);
      continue;
    }
  }
  throw new Error(lastError?.message || 'All models failed. Check VITE_GEMINI_API_KEY in .env and enable Generative Language API in Google Cloud.');
}

// Optional: advice endpoint using new SDK
export async function getBriefAdviceNew(habitTitle) {
  const client = ensureClient();
  const prompt = `Give one concise improvement tip (max 2 short sentences) for the daily habit: "${habitTitle}"`;
  const response = await client.models.generateContent({
    model: MODEL_CHAIN[0],
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 80 }
  });
  return (response.text || '').trim();
}
