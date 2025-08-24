
'use server';
/**
 * @fileOverview A doubt-solving AI agent for students.
 *
 * - solveDoubt - A function that handles the doubt-solving process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DoubtSolverInputSchema = z.string();
const DoubtSolverOutputSchema = z.string();

export async function solveDoubt(prompt: string): Promise<string> {
    if (!prompt || !prompt.trim()) {
        throw new Error("Prompt cannot be empty.");
    }
    return doubtSolverFlow(prompt);
}

const doubtSolverPrompt = ai.definePrompt({
    name: 'doubtSolverPrompt',
    input: {schema: DoubtSolverInputSchema},
    output: {schema: DoubtSolverOutputSchema},
    prompt: `You are "Topper's AI Assistant", an expert academic tutor.
Answer the student's question directly and thoroughly.
Do not introduce yourself.
Format your response in Markdown for clarity.

Here is the student's question:
{{{input}}}`,
});

const doubtSolverFlow = ai.defineFlow(
    {
        name: 'doubtSolverFlow',
        inputSchema: DoubtSolverInputSchema,
        outputSchema: DoubtSolverOutputSchema,
    },
    async (prompt) => {
        const result = await doubtSolverPrompt(prompt);
        const output = result.text;

        if (!output) {
            const history = result.history;
            if (history && history.length > 0) {
                const lastEvent = history[history.length - 1];
                if (lastEvent.type === 'response' && lastEvent.output.error) {
                    throw new Error(`AI model failed to generate response: ${lastEvent.output.error.message}`);
                }
            }
            throw new Error("AI model returned an empty response.");
        }
        return output;
    }
);
