
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for Google API Key, crucial for the googleAI plugin
if (!process.env.GOOGLE_API_KEY) {
  const errorMsg = "CRITICAL_ERROR_TRACE: Missing GOOGLE_API_KEY environment variable. This is required for Genkit GoogleAI plugin. \nACTION: Please set this variable in your .env.local file (for local development) or in your deployment environment settings. Restart your server after adding it. \nGenkit AI features will not work without it.";
  console.error("🔴🔴🔴 FATAL SETUP ERROR 🔴🔴🔴");
  console.error(errorMsg);
  console.error("Genkit AI features will be non-functional.");
  console.error("🔴🔴🔴 END FATAL SETUP ERROR 🔴🔴🔴");
  throw new Error(errorMsg);
}

let aiInstance;

try {
  aiInstance = genkit({
    plugins: [
      googleAI(),
    ],
    model: 'googleai/gemini-2.0-flash',
  });
} catch (e: any) {
  const errorMsg = `CRITICAL_ERROR_TRACE: Genkit AI client or GoogleAI plugin initialization failed unexpectedly.
This might be due to an invalid or malformed GOOGLE_API_KEY (even if present), network issues,
problems with the Genkit/GoogleAI library versions, or other plugin configuration errors.
ACTION: Ensure your GOOGLE_API_KEY is correct and valid. Restart your server after making changes.
DETAILS: Specific error from Genkit/GoogleAI library: ${e.message}`;
  console.error("🔴🔴🔴 FATAL CLIENT INIT ERROR 🔴🔴🔴");
  console.error(errorMsg, e);
  console.error("Genkit AI features will be non-functional.");
  console.error("🔴🔴🔴 END FATAL CLIENT INIT ERROR 🔴🔴🔴");
  throw new Error(errorMsg);
}

export const ai = aiInstance;
