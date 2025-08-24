'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { next as genkitNext } from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
    genkitNext(),
  ],
  logSinks: [
    async (level, ...args) => {
      console.log(`[${level}]`, ...args);
    },
  ],
  enableTracingAndMetrics: true,
});
