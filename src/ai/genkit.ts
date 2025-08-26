
/**
 * @fileoverview This file initializes the Genkit AI platform with the necessary plugins.
 * It exports a configured 'ai' object that can be used throughout the application
 * to interact with generative models.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This allows the use of Google's generative models like Gemini.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
