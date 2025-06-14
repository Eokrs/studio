
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for Google API Key, crucial for the googleAI plugin
if (!process.env.GOOGLE_API_KEY) {
  const errorMsg = 'CRITICAL: Missing GOOGLE_API_KEY environment variable. This is required for the Genkit GoogleAI plugin to initialize. Please set this variable in your deployment environment (e.g., Netlify environment settings or .env.local file for local development). Genkit AI features will not work without it.';
  console.error(errorMsg);
  // Throwing an error here will likely result in an Internal Server Error if this module is loaded server-side,
  // but the console log above should provide a clear indication in server logs.
  throw new Error(errorMsg);
}

let aiInstance;

try {
  aiInstance = genkit({
    plugins: [
      googleAI(), // This may throw if API key is present but invalid/malformed, or if the plugin itself has an issue.
    ],
    model: 'googleai/gemini-2.0-flash',
  });
} catch (e: any) {
  const errorMsg = `CRITICAL: Genkit AI client or GoogleAI plugin initialization failed unexpectedly.
This might be due to an invalid or malformed GOOGLE_API_KEY (even if present), network issues, 
problems with the Genkit/GoogleAI library versions, or other plugin configuration errors. 
Ensure your GOOGLE_API_KEY is correct and valid.
Error Details: ${e.message}`;
  console.error(errorMsg, e);
  throw new Error(errorMsg);
}

export const ai = aiInstance;
