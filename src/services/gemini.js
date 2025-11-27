// LEGACY Gemini service (kept as fallback). New service in geminiNew.js using @google/genai.
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment configuration
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
// Allow overriding model; default to fast, widely available model
// Model fallback chain (ordered by preference). We'll try env override first.
const requestedModel = import.meta.env.VITE_GEMINI_MODEL?.trim();
const MODEL_FALLBACKS = [
  requestedModel,
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest'
].filter(Boolean);
let activeModel = MODEL_FALLBACKS[0];

// Debug: Check if API key & model are loaded
if (!apiKey) {
  console.error('❌ VITE_GEMINI_API_KEY is not set. Add it to .env and restart dev server.');
} else {
  console.log(`✅ Gemini API key loaded: ${apiKey.substring(0, 10)}... initial model preference: ${activeModel}`);
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate personalized habit suggestions using Gemini AI
 * @param {string} persona - User's description of who they want to be
 * @param {Array} existingHabits - User's current habits to avoid duplicates
 * @returns {Promise<Array>} Array of habit suggestions with title and goal
 */
export async function generateHabitSuggestions(persona, existingHabits = []) {
  // Prefer new service externally; this remains for fallback only.
  try {
    if (!apiKey) {
      throw new Error('API key not configured. Please add VITE_GEMINI_API_KEY to .env and restart.');
    }
    console.log('🧠 Generating AI suggestions for persona:', persona, 'model chain:', MODEL_FALLBACKS.join(' -> '));

    const existingHabitsText = existingHabits.length > 0
      ? `\n\nUser's existing habits (avoid duplicates):\n${existingHabits.map(h => `- ${h.title}`).join('\n')}`
      : '';

    const prompt = `You are a habit formation expert and life coach. Based on the following persona description, generate exactly 5 personalized daily habit suggestions.

Persona: "${persona}"${existingHabitsText}

Requirements:
1. Generate habits that align with the persona's goals and identity
2. Make habits specific, measurable, and achievable
3. Include a realistic monthly goal (number of days to complete in 30 days)
4. Focus on daily habits that compound over time
5. Avoid duplicating existing habits
6. Consider different life areas: health, productivity, learning, mindfulness, relationships

Return ONLY a valid JSON array with this exact format (no markdown, no code blocks, no explanation):
[
  {"title": "Habit name", "goal": 25},
  {"title": "Habit name", "goal": 28},
  {"title": "Habit name", "goal": 30},
  {"title": "Habit name", "goal": 22},
  {"title": "Habit name", "goal": 26}
]

Important: 
- Goals should be between 15-30 (realistic for different difficulty levels)
- Titles should be clear and action-oriented (e.g., "Write 500 words daily" not just "Writing")
- Return ONLY the JSON array, nothing else`;

    let text = '';
    let lastError = null;
    for (const candidateModel of MODEL_FALLBACKS) {
      activeModel = candidateModel;
      console.log(`🔍 Attempting model: ${candidateModel}`);
      try {
        // Attempt SDK first
        const model = genAI.getGenerativeModel({ model: candidateModel });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        console.log(`✅ Model succeeded via SDK: ${candidateModel}`);
        break; // success
      } catch (sdkError) {
        lastError = sdkError;
        if (/404|not found/i.test(sdkError.message)) {
          console.warn(`⚠️ Model ${candidateModel} returned 404. Trying next fallback...`);
          continue; // try next model
        }
        console.warn(`SDK error for model ${candidateModel}: ${sdkError.message}. Trying REST fallback...`);
        // REST fallback for non-404 errors
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${apiKey}`;
          const body = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 512 }
          };
            const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!resp.ok) {
            const errorPayload = await resp.text();
            lastError = new Error(`REST ${candidateModel} failed (${resp.status}): ${errorPayload}`);
            if (resp.status === 404) {
              console.warn(`⚠️ REST also 404 for ${candidateModel}. Next fallback...`);
              continue;
            }
            console.warn(`REST error for ${candidateModel}: ${lastError.message}`);
            continue; // move to next model in chain
          }
          const json = await resp.json();
          text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (!text) {
            lastError = new Error(`Empty response from REST for ${candidateModel}`);
            continue;
          }
          console.log(`✅ Model succeeded via REST: ${candidateModel}`);
          break; // success
        } catch (restError) {
          lastError = restError;
          console.warn(`REST fallback failed for ${candidateModel}: ${restError.message}`);
          continue;
        }
      }
    }
    if (!text) {
      throw lastError || new Error('All model fallbacks failed');
    }
    
    // Clean the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    // Parse the JSON response
    const suggestions = JSON.parse(cleanedText);
    
    // Validate the response
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Invalid response format from AI');
    }

    // Ensure each suggestion has required fields
    const validatedSuggestions = suggestions.slice(0, 5).map(habit => ({
      title: habit.title || 'Untitled Habit',
      goal: Math.min(Math.max(parseInt(habit.goal) || 25, 15), 30) // Clamp between 15-30
    }));

    return validatedSuggestions;
  } catch (error) {
    console.error('❌ Error generating habit suggestions');
    console.error('Final activeModel attempted:', activeModel);
    console.error('Message:', error.message);
    // Provide granular user feedback
    if (/not set|API key/i.test(error.message)) {
      throw new Error('API key missing. Set VITE_GEMINI_API_KEY in .env and restart dev server.');
    }
    if (/401|403/.test(error.message)) {
      throw new Error('Unauthorized. Verify Gemini API key and project access, then retry.');
    }
    if (/404/.test(error.message)) {
      throw new Error(`All fallback models unavailable. In .env set VITE_GEMINI_MODEL=gemini-1.5-flash (or gemini-1.5-pro), ensure VITE_GEMINI_API_KEY is valid, and enable the Generative Language API (Gemini) in your Google Cloud project (APIs & Services > Library). After updating, restart the dev server.`);
    }
    if (/rate|quota|429/i.test(error.message)) {
      throw new Error('Rate limit reached. Wait 60 seconds and try again.');
    }
    if (/network|fetch|Failed to fetch|ENOTFOUND/i.test(error.message)) {
      throw new Error('Network error. Check connectivity, VPN/firewall, then retry.');
    }
    if (error instanceof SyntaxError) {
      throw new Error('AI response parsing error. Retry with a more detailed persona.');
    }
    throw new Error(error.message || 'Unknown AI error. Please retry.');
  }
}

/**
 * Get personalized advice for improving a specific habit
 * @param {string} habitTitle - The habit to get advice for
 * @param {number} completionRate - Current completion rate (0-100)
 * @param {number} streak - Current streak days
 * @returns {Promise<string>} Personalized advice
 */
export async function getHabitAdvice(habitTitle, completionRate, streak) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a habit formation expert. Provide brief, actionable advice (2-3 sentences max) for someone working on this habit:

Habit: "${habitTitle}"
Current completion rate: ${completionRate}%
Current streak: ${streak} days

Give specific, encouraging advice to help them improve. Focus on practical strategies, not generic motivation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error getting habit advice:', error);
    throw new Error('Failed to get advice. Please try again.');
  }
}

/**
 * Analyze user's overall habit performance and provide insights
 * @param {Array} habits - User's habits with completion data
 * @param {number} overallCompletionRate - Overall completion percentage
 * @returns {Promise<string>} Analysis and recommendations
 */
export async function analyzeHabitPerformance(habits, overallCompletionRate) {
  try {
    const model = genAI.getGenerativeAI({ model: 'gemini-pro' });

    const habitsText = habits.map(h => 
      `- ${h.title}: ${h.completionRate || 0}% (Streak: ${h.streak || 0} days)`
    ).join('\n');

    const prompt = `You are a habit formation expert. Analyze this user's habit tracking data and provide brief insights (3-4 sentences):

Overall completion rate: ${overallCompletionRate}%

Habits:
${habitsText}

Provide:
1. One key strength or pattern
2. One main area for improvement
3. One specific, actionable recommendation

Keep it encouraging but honest. Be concise.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw new Error('Failed to analyze performance. Please try again.');
  }
}
