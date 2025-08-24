'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const doubtSolverPrompt = ai.definePrompt(
  {
    name: 'doubtSolverPrompt',
    input: { schema: z.string() },
    output: { schema: z.string() },
    config: {
      model: 'googleai/gemini-2.5-flash-lite',
      temperature: 0.5,
       safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        },
      ],
    },
    prompt: `You are "Topper\'s AI Assistant", an expert academic tutor for high school students.
Answer the student\'s question directly and thoroughly.
Do not introduce yourself. Do not add any conversational filler like "Hello!".
Format your response in Markdown for clarity (using headings, lists, bold text, etc.).

Student's question:
{{{input}}}`,
  },
);

export const solveDoubt = ai.defineFlow(
  {
    name: 'solveDoubt',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.string(),
  },
  async ({ prompt }) => {
    if (!prompt || !prompt.trim()) {
      throw new Error('Prompt cannot be empty.');
    }

    const result = await doubtSolverPrompt(prompt);
    const answer = result.text;

    if (!answer) {
      throw new Error('The AI failed to generate a response. Please try again.');
    }

    return answer;
  }
);
