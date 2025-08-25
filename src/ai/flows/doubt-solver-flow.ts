
'use server';
/**
 * @fileOverview Academic doubt solver AI agent using Gemini 2.5 Flash.
 *
 * This file defines the Genkit flow for an AI-powered academic doubt solver.
 * It includes a tool to search the local knowledge base (notes) and a prompt
 * designed to provide contextual answers to student questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getChatHistory, saveChatMessage, getAllNotes } from '@/lib/data';
import type { ChatMessage } from '@/lib/types';

/* ---------------------------------
 * Input Schema Definition
 * --------------------------------- */
const DoubtSolverInputSchema = z.object({
  userId: z.string(),
  question: z.string(),
});

/* ---------------------------------
 * Tool: Knowledge Base Search
 * --------------------------------- */
const KnowledgeBaseTool = ai.defineTool(
  {
    name: 'getRelevantSubjects',
    description:
      "Searches the website's curriculum to find relevant subjects, sub-subjects, or chapters for a user's academic question. This tool MUST be used first to check for existing content before answering.",
    inputSchema: z.object({
      query: z.string().describe("The student's academic question or topic of interest."),
    }),
    outputSchema: z.string().describe(
      'A summary of relevant subjects, sub-subjects, and chapters from the knowledge base, or a message indicating no relevant content was found.',
    ),
  },
  async ({ query }) => {
    const notes = await getAllNotes();
    const lowerCaseQuery = query.toLowerCase();

    const relevantNotes = notes.filter(
      (note) =>
        note.subjectName.toLowerCase().includes(lowerCaseQuery) ||
        note.subSubjectName.toLowerCase().includes(lowerCaseQuery) ||
        note.chapter.toLowerCase().includes(lowerCaseQuery) ||
        note.type.toLowerCase().includes(lowerCaseQuery),
    );

    if (relevantNotes.length === 0) {
      return 'No specific subjects, chapters, or notes matching the query were found in the knowledge base.';
    }

    const summary = new Set<string>();
    relevantNotes.forEach((note) => {
      summary.add(
        `Subject: ${note.subjectName} -> Sub-Subject: ${note.subSubjectName} -> Chapter: ${note.chapter}`,
      );
    });

    return `Found the following relevant content in the knowledge base:\n- ${Array.from(summary).join(
      '\n- ',
    )}`;
  },
);

/* ---------------------------------
 * Prompt Definition (Gemini 2.5 Flash)
 * --------------------------------- */
const doubtSolverPrompt = ai.definePrompt(
  {
    name: 'doubtSolverPrompt',
    model: 'googleai/gemini-2.5-flash',
    tools: [KnowledgeBaseTool],
    system: `You are "Topper's AI Tutor," a friendly and expert academic assistant for students.
- Your primary function is to answer academic questions.
- Your first step is ALWAYS to use the 'getRelevantSubjects' tool to check the website's content for context.
- If the tool finds relevant content, you MUST use it as the primary source for your answer.
- If the tool finds no relevant content, use your general knowledge but inform the user that specific notes on this topic are not yet available on the website.
- If the user's query is conversational (e.g., "hello", "how are you?"), respond naturally without using the tool.
- Keep answers clear, encouraging, and easy for students to understand.
- Use Markdown for formatting (lists, **bold text**, etc.) to improve readability.`,
    input: { schema: DoubtSolverInputSchema },
    output: { schema: z.string() },
  },
  async (input) => {
    const history = await getChatHistory(input.userId);
    return {
      prompt: `{{#if history}}
This is the chat history so far:
{{#each history}}
{{role}}: {{{content}}}
{{/each}}
{{/if}}

The user's new question is:
{{{question}}}`,
      history: history.map((msg) => ({
        role: msg.role as 'user' | 'model',
        content: msg.content,
      })),
      question: input.question,
    };
  },
);

/* ---------------------------------
 * Flow Definition
 * --------------------------------- */
const doubtSolverFlow = ai.defineFlow(
  {
    name: 'doubtSolverFlow',
    inputSchema: DoubtSolverInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      // Correctly call the prompt and get the response text
      const response = await doubtSolverPrompt(input);
      return response.text;
    } catch (error) {
      console.error('Error in doubtSolverFlow:', error);
      throw error;
    }
  },
);

/* ---------------------------------
 * Exported Server Action
 * --------------------------------- */
export async function solveDoubt(
  question: string,
  userId: string,
): Promise<ChatMessage[]> {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // 1. Save the user's message
  const userMessage: ChatMessage = { role: 'user', content: question, timestamp: Date.now() };
  await saveChatMessage(userId, userMessage);
  
  try {
    // 2. Run the AI flow to get the model's response
    const modelResponse = await doubtSolverFlow({ question, userId });
    
    if (!modelResponse) {
      throw new Error('Received an empty response from the AI model.');
    }
    
    // 3. Save the model's message
    const modelMessage: ChatMessage = { role: 'model', content: modelResponse, timestamp: Date.now() };
    await saveChatMessage(userId, modelMessage);

    // 4. Return the full, updated chat history
    return getChatHistory(userId);

  } catch (error) {
    console.error("Error in solveDoubt server action:", error);
    // Re-throw so the client can catch it and display the error
    throw error;
  }
}
