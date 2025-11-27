# Gemini AI Troubleshooting Guide

If you are seeing the error:

> "All fallback models unavailable. In .env set VITE_GEMINI_MODEL=gemini-1.5-flash..."

Follow these steps to fix it:

## 1. Check your `.env` file

Ensure you have a file named `.env` in the root of your project (next to `package.json`).
It should contain:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_starting_with_AIza
VITE_GEMINI_MODEL=gemini-1.5-flash
```

**Note:** Do not use quotes around the values unless they contain spaces (which API keys shouldn't).

## 2. Verify API Key & Permissions

1. Go to [Google AI Studio](https://aistudio.google.com/) to generate a key.
2. If using Google Cloud Console:
   - Go to **APIs & Services > Library**.
   - Search for **"Generative Language API"**.
   - Click **Enable**.
   - Ensure your API key has no restrictions that block this API.

## 3. Restart the Dev Server

Vite loads environment variables only when the server starts.
Stop the server (Ctrl+C) and run:

```powershell
npm run dev
```

## 4. Check Network

- Ensure you are not behind a corporate firewall blocking `generativelanguage.googleapis.com`.
- Check the browser console (F12) for any `403` (Permission) or `404` (Not Found) errors.

## 5. Verify Model Availability

The app tries these models in order:

1. `VITE_GEMINI_MODEL` (if set)
2. `gemini-1.5-flash` (Fast, recommended)
3. `gemini-1.5-pro` (Higher quality, slower)

If all fail, it usually means the API Key is invalid or the API is not enabled for your project.
