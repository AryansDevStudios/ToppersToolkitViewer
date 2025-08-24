
'use server';
/**
 * @fileOverview A doubt-solving AI agent for students.
 *
 * - solveDoubt - A function that handles the doubt-solving process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DoubtSolverInputSchema = z.string();
const DoubtSolverOutputSchema = z.string();

export async function solveDoubt(prompt: string): Promise<string> {
    return doubtSolverFlow(prompt);
}

const doubtSolverPrompt = ai.definePrompt({
    name: 'doubtSolverPrompt',
    prompt: `You are an expert educator and academic guide for high school students. Your name is "Topper's AI Assistant".

    A student has asked the following question. Your task is to provide a clear, concise, and step-by-step answer.

    - If the question is academic, break down the concept and explain it simply.
    - If it's a problem, solve it with a detailed explanation for each step.
    - If it's a question about a topic, provide a comprehensive but easy-to-understand summary.
    - If the question is outside academic topics, politely decline to answer and remind the user of your purpose.
    - Format your response using Markdown for readability (e.g., use headings, lists, bold text).

    Student's question:
    {{{input}}}`,
});

const doubtSolverFlow = ai.defineFlow(
    {
        name: 'doubtSolverFlow',
        inputSchema: DoubtSolverInputSchema,
        outputSchema: DoubtSolverOutputSchema,
    },
    async (input) => {
        const result = await doubtSolverPrompt({input});
        const output = result.output;

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
