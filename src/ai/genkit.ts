'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logSinks: [
    async (level, ...args) => {
      console.log(`[${level}]`, ...args);
    },
  ],
  enableTracingAndMetrics: true,
});
