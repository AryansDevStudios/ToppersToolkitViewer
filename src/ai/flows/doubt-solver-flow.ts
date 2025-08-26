
'use server';

import { ai } from '@/ai/genkit';
import { getChatHistory, saveChatMessage } from '@/lib/data';
import { z } from 'zod';
import type { ChatMessage } from '@/lib/types';
import { googleAI } from '@genkit-ai/googleai';


// Define the main prompt for the doubt solver
const doubtSolverPrompt = ai.definePrompt(
  {
    name: 'doubtSolverPrompt',
    model: googleAI('gemini-1.5-flash'),
    system: `
      You are a friendly and helpful AI assistant for a student platform called "Topper's Toolkit".
      Your role is to answer student's questions clearly and concisely.
      Keep your answers easy to understand for a student.
      Format your responses using Markdown for better readability (e.g., use lists, bold text).
    `,
    input: {
      schema: z.object({
        question: z.string(),
      }),
    },
    output: {
      schema: z.string().describe('The final answer to the user.'),
    },
  }
);


// The main server action that the client will call
export async function solveDoubt(userId: string, question: string): Promise<ChatMessage[]> {
  console.log(`[solveDoubt] Received question from user ${userId}: "${question}"`);

  // 1. Save the user's new message
  const userMessage: ChatMessage = { role: 'user', content: question, timestamp: Date.now() };
  await saveChatMessage(userId, userMessage);

  // 2. Generate the AI's response
  try {
    const { output } = await doubtSolverPrompt({ input: { question } });

    if (!output) {
      throw new Error("The model did not return a valid response.");
    }
    
    // 3. Save the model's response
    const modelMessage: ChatMessage = { role: 'model', content: output, timestamp: Date.now() };
    await saveChatMessage(userId, modelMessage);

  } catch (error: any) {
    console.error(`[solveDoubt] Error generating response for user ${userId}:`, error);
    const errorMessage: ChatMessage = {
      role: 'model',
      content: `An error occurred. Details:\n${JSON.stringify({ name: error.name, message: error.message, stack: error.stack, digest: (error as any).digest }, null, 2)}`,
      timestamp: Date.now(),
    };
    await saveChatMessage(userId, errorMessage);
  }

  // 4. Return the final, complete chat history
  return getChatHistory(userId);
}
