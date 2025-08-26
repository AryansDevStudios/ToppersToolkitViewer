'use server';
/**
 * @fileOverview A simple AI doubt solver flow.
 *
 * - solveDoubt - A server action that manages the chat conversation.
 */
import { ai } from '@/ai/genkit';
import { getChatHistory, saveChatMessage } from '@/lib/data';
import type { ChatMessage } from '@/lib/types';
import { z } from 'zod';
import { HumanMessage, AIMessage } from '@genkit-ai/ai/message';

// Define the schema for the flow's input
const DoubtSolverInputSchema = z.object({
  question: z.string(),
  history: z.array(z.custom<ChatMessage>()),
});

// 1. Define the Genkit Flow
const doubtSolverFlow = ai.defineFlow(
  {
    name: 'doubtSolverFlow',
    inputSchema: DoubtSolverInputSchema,
    outputSchema: z.string(),
  },
  async ({ question, history }) => {

    const modelResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: {
        system: `You are a helpful academic assistant for students. Your name is Topper.
        Answer the user's question clearly and concisely. If the user greets you, greet them back warmly.`,
        messages: [
            ...history.map(msg => {
                if (msg.role === 'user') return new HumanMessage(msg.content);
                return new AIMessage(msg.content);
            }),
            new HumanMessage(question)
        ]
      },
    });

    return modelResponse.text;
  }
);


// 2. Define the Server Action that the client will call
export async function solveDoubt(
  userId: string,
  question: string
): Promise<ChatMessage[]> {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  // Get existing chat history
  const history = await getChatHistory(userId);

  // Add the user's new question to the history for context
  const userMessage: ChatMessage = {
    role: 'user',
    content: question,
    timestamp: Date.now(),
  };
  
  // Call the Genkit flow to get the AI's answer
  const answer = await doubtSolverFlow({
    question,
    history: [...history, userMessage], // Pass full history to the model
  });
  
  const modelMessage: ChatMessage = {
    role: 'model',
    content: answer,
    timestamp: Date.now(),
  };

  // Save both the user's question and the model's answer
  await saveChatMessage(userId, userMessage);
  await saveChatMessage(userId, modelMessage);

  // Return the full, updated chat history
  return getChatHistory(userId);
}
