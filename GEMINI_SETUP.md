# Google Gemini AI Integration Setup Guide

## Overview

FocusLab now uses **Google Gemini AI** for real, intelligent habit suggestions. The AI analyzes your persona description and generates personalized, actionable habits tailored to your goals.

## Features

✅ **Real AI-Powered Suggestions** - Uses Google's Gemini models (flash / pro)  
✅ **Personalized Recommendations** - Based on your goals and identity  
✅ **Smart Duplicate Detection** - Avoids suggesting habits you already have  
✅ **Context-Aware** - Considers different life areas: health, productivity, learning, mindfulness  
✅ **Dark/Light Mode Support** - Beautiful UI in both themes

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**

   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**

   - Click **"Get API Key"**
   - Click **"Create API key in new project"** (or select existing project)
   - Copy your API key (starts with `AIza...`)

3. **Important Security Notes**
   ⚠️ Keep your API key secret - never commit it to GitHub  
   ⚠️ Never share your API key publicly  
   ⚠️ Use `.env` file (already in `.gitignore`)

### Step 2: Configure Your Project

1. **Create `.env` file** (if it doesn't exist)

   ```bash
   # Copy from example
   cp .env.example .env
   ```

2. **Add your Gemini API key** (and optional model override) to `.env`:

   ```env
   # Your existing Firebase config
   VITE_FIREBASE_API_KEY=your_firebase_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Google Gemini AI (required)
   VITE_GEMINI_API_KEY=AIza...your_actual_key_here

   # Optional: choose model (defaults to gemini-1.5-flash)
   # Common options:
   # gemini-1.5-flash  (fast, cost-effective, good quality)
   # gemini-1.5-pro    (higher reasoning quality, slower)
   # gemini-1.5-pro-exp (experimental improvements; may change)
   VITE_GEMINI_MODEL=gemini-1.5-flash
   ```

3. **Restart your development server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Start again
   npm run dev
   ```

### Step 3: Test the Integration

1. **Open FocusLab** in your browser
2. **Navigate to Habit Tracker tab**
3. **Click "AI Coach"** button (purple gradient button)
4. **Try a persona**:
   - Example: "A disciplined writer who wants to publish a book"
   - Click **Generate**
   - Wait 2-5 seconds for AI to respond
5. **Review suggestions** and click **Add** to add habits

### (Optional) Switching Models

If you want higher reasoning quality (slightly slower):

```env
VITE_GEMINI_MODEL=gemini-1.5-pro
```

If a model returns 404 / not found errors, switch back:

```env
VITE_GEMINI_MODEL=gemini-1.5-flash
```

After changing the model, always restart:

```bash
Ctrl+C
npm run dev
```

### Supported Models (Stable)

| Model            | Best For                   | Speed  | Cost   |
| ---------------- | -------------------------- | ------ | ------ |
| gemini-1.5-flash | General quick suggestions  | Fast   | Low    |
| gemini-1.5-pro   | Deeper reasoning & context | Medium | Higher |

Preview / experimental model names (e.g. `gemini-3-pro-preview`) are not guaranteed to work for all API keys and may return 404. Avoid them unless explicitly enabled in your account.

If you see `Model not found` errors:

1. Verify the Generative Language API is enabled in Google Cloud Console.
2. Switch to `gemini-1.5-flash` in `.env`.
3. Regenerate API key if key is very old.
4. Remove VPN / proxy that may block requests.

### Common Errors & Fixes

| Error Message           | Cause                              | Fix                                      |
| ----------------------- | ---------------------------------- | ---------------------------------------- |
| Model not found         | Incorrect / unsupported model name | Set `VITE_GEMINI_MODEL=gemini-1.5-flash` |
| Permission denied / 403 | API not enabled or key restricted  | Enable API + relax restrictions          |
| Rate limit / quota      | Too many requests                  | Wait 60s then retry                      |
| Network error           | Connectivity / firewall            | Check internet, disable VPN, retry       |
| Empty AI response       | Transient service hiccup           | Retry with more detailed persona         |

## How It Works

### 1. Persona Analysis

The AI analyzes your description to understand:

- Your goals and aspirations
- Your current life stage
- Your priorities and values
- Your challenges and constraints

### 2. Habit Generation

Gemini generates 5 personalized habits that:

- Align with your identity and goals
- Are specific and measurable
- Have realistic monthly goals (15-30 days)
- Focus on different life areas
- Avoid duplicating your existing habits

### 3. Smart Filtering

The system automatically:

- Validates AI responses
- Ensures proper format (title + goal)
- Clamps goals between 15-30 days
- Removes duplicates

## API Usage & Costs

### Free Tier (Gemini API)

- **60 requests per minute**
- **1,500 requests per day**
- **1 million requests per month**
- **FREE** for personal use

### Typical Usage

- Each "Generate" click = 1 API request
- Average user: 5-10 requests per day
- Well within free tier limits

### Rate Limits

If you hit rate limits, you'll see an error. Wait 60 seconds and try again.

## Troubleshooting

### Error: "Failed to generate suggestions"

**Possible causes:**

1. **No API Key**: Check `.env` file has `VITE_GEMINI_API_KEY`
2. **Invalid API Key**: Verify key is correct (starts with `AIza`)
3. **Rate Limit**: Wait 60 seconds and try again
4. **Network Issue**: Check internet connection

**Solution:**

```bash
# 1. Check .env file exists
ls .env

# 2. Verify API key is set
cat .env | grep GEMINI

# 3. Restart dev server
npm run dev
```

### API Key Not Working

1. **Verify key in Google AI Studio**

   - Go to https://makersuite.google.com/app/apikey
   - Check if key is active
   - Regenerate if needed

2. **Check environment variable**

   ```bash
   # .env should have (no quotes, no spaces)
   VITE_GEMINI_API_KEY=AIzaYourActualKeyHere
   ```

3. **Restart server** - Required after changing `.env`

### AI Suggestions Not Personalized

- **Use detailed descriptions**:
  ❌ Bad: "developer"
  ✅ Good: "A full-stack developer who wants to build a SaaS product while maintaining work-life balance"

- **Include context**:
  - Current challenges
  - Specific goals
  - Time constraints
  - Personal values

## Example Personas

### 🎯 Highly Effective Personas

1. **"A software engineer who wants to become a tech lead while staying healthy"**

   - Results: Mix of technical learning + health habits

2. **"An aspiring novelist working a 9-5 job with limited evening time"**

   - Results: Time-efficient writing habits + energy management

3. **"A college student struggling with procrastination and anxiety"**

   - Results: Study habits + mental health practices

4. **"An entrepreneur building their first startup on nights and weekends"**
   - Results: Productive time management + sustainable energy

### ❌ Less Effective Personas

- "developer" (too vague)
- "someone" (no identity)
- "person" (generic)

## Advanced Configuration

### Custom Gemini Model

Edit `src/services/gemini.js` to use different models:

```javascript
// Default (recommended)
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// For multimodal (images + text)
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
```

### Adjust Generation Parameters

```javascript
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.7, // Creativity (0-1)
    topK: 40, // Diversity
    topP: 0.95, // Nucleus sampling
    maxOutputTokens: 1024, // Max response length
  },
});
```

## Security Best Practices

### ✅ DO

- Keep API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables (`import.meta.env.VITE_*`)
- Rotate keys if exposed

### ❌ DON'T

- Commit API keys to GitHub
- Share keys in public channels
- Hardcode keys in source code
- Use production keys in development

## Support

### Google Gemini Documentation

- API Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing
- API Keys: https://makersuite.google.com/app/apikey

### FocusLab Issues

- Check console for errors (F12 → Console tab)
- Review `.env` configuration
- Restart dev server
- Clear browser cache

## Future Enhancements

🔮 **Coming Soon:**

- 📊 **Habit Analysis** - AI insights on your progress
- 💡 **Personalized Advice** - Tips to improve specific habits
- 🎯 **Goal Recommendations** - Optimal monthly goals based on your history
- 🏆 **Achievement Predictions** - AI forecasts your success rate

---

**🎉 Enjoy your AI-powered habit coach!**

Built with ❤️ using Google Gemini AI
