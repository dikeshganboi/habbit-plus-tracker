// Test file to verify Gemini AI integration
// Run this with: node test-gemini.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill import.meta.env for Node.js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  console.log('DEBUG: .env content length:', envContent.length);
  console.log('DEBUG: First 100 chars:', JSON.stringify(envContent.substring(0, 100)));
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      env[key] = value;
    }
  });
}

// Mock import.meta.env
global.import = { meta: { env } }; 
// Note: The above global hack won't work for ES modules importing other modules that use import.meta.env directly 
// because import.meta is per-module. 
// Instead, we will read the key here and pass it if we were calling a function that took a key, 
// but gemini.js reads it from import.meta.env at the top level.
// 
// A better approach for this test script is to use the SDK directly to test the key, 
// bypassing gemini.js which is coupled to Vite.

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiDirectly() {
  console.log('🧪 Testing Gemini API Key directly...\n');

  const apiKey = env.VITE_GEMINI_API_KEY;
  const modelName = env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY not found in .env file.');
    return;
  }

  console.log(`🔑 API Key found: ${apiKey.substring(0, 8)}...`);
  console.log(`🤖 Target Model: ${modelName}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log('📡 Sending test request...');
    const result = await model.generateContent('Say "Hello from Gemini!" if you can hear me.');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Success! Response received:');
    console.log(`   "${text.trim()}"`);
    console.log('\n🎉 Your API key and environment are correctly configured!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('404')) {
      console.error('   -> Model not found. Check VITE_GEMINI_MODEL in .env.');
    } else if (error.message.includes('403') || error.message.includes('permission')) {
      console.error('   -> Permission denied. Enable "Generative Language API" in Google Cloud Console.');
    }
  }
}

testGeminiDirectly();

/*
import { generateHabitSuggestions } from './src/services/gemini.js';

async function testGeminiIntegration() {
...existing code...
*/
