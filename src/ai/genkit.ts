import { genkit, readableFromAsync } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { next } from '@genkit-ai/next';
import { defineFlow, runFlow } from 'genkit/flow';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
    next(),
  ],
  logSinks: [
    (level, ...args) => {
      console.log(`[${level}]`, ...args);
    },
  ],
  enableTracingAndMetrics: true,
});
