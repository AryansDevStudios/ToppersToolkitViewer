'use server';
/**
 * @fileOverview A doubt-solving AI agent for students.
 *
 * - solveDoubt - A function that handles the doubt-solving process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DoubtSolverInputSchema = z.string().min(1, "Question cannot be empty");
const DoubtSolverOutputSchema = z.string();

// Define AI prompt
const doubtSolverPrompt = ai.definePrompt({
  name: 'doubtSolverPrompt',
  input: { schema: DoubtSolverInputSchema },
  output: { schema: DoubtSolverOutputSchema },
  prompt: `You are "Topper's AI Assistant", an expert high-school academic tutor.

Instructions:
- Directly answer the student's question in detail.
- Do NOT introduce yourself or repeat the question.
- Use simple explanations, step-by-step reasoning, and examples when useful.
- If the question is outside academics, politely decline.
- Format your response with Markdown (headings, bullet points, bold text, etc).

Student's question:
{{{input}}}`,
});

// Define the main AI flow
const doubtSolverFlow = ai.defineFlow(
  {
    name: 'doubtSolverFlow',
    inputSchema: DoubtSolverInputSchema,
    outputSchema: DoubtSolverOutputSchema,
  },
  async (prompt) => {
    // Extra safeguard inside the flow
    if (!prompt || !prompt.trim()) {
      throw new Error("AI flow received an empty question.");
    }

    const result = await doubtSolverPrompt(prompt);
    const output = result.text?.trim();

    if (!output) {
      throw new Error("AI model returned an empty or invalid response.");
    }

    return output;
  }
);

// Export the flow directly for client-side use
export const solveDoubt = doubtSolverFlow;
