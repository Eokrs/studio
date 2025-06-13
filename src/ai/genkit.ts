
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for Google API Key, crucial for the googleAI plugin
if (!process.env.GOOGLE_API_KEY) {
  const errorMsg = 'CRITICAL: Missing GOOGLE_API_KEY environment variable. This is required for the Genkit GoogleAI plugin to initialize. Please set this variable in your deployment environment (e.g., Netlify environment settings).';
  console.error(errorMsg);
  // Throwing an error here will likely result in an Internal Server Error if this module is loaded server-side,
  // but the console log above should provide a clear indication in server logs.
  throw new Error(errorMsg);
}

export const ai = genkit({
  plugins: [
    googleAI(), // This may throw if API key is missing or invalid despite the check above
  ],
  model: 'googleai/gemini-2.0-flash',
});

