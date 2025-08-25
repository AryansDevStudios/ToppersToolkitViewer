'use server';
/**
 * Academic doubt solver AI agent using Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getChatHistory, saveChatMessage, getAllNotes } from '@/lib/data';
import { ChatMessage } from '@/lib/types';

/* -----------------------------
 * Tool: Knowledge Base Search
 * ----------------------------- */
const KnowledgeBaseTool = ai.defineTool(
  {
    name: 'getRelevantSubjects',
    description:
      "Searches the website's curriculum to find relevant subjects, sub-subjects, or chapters for a user's academic question.",
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

/* -----------------------------
 * Prompt Definition (Gemini 2.5 Flash)
 * ----------------------------- */
const DoubtSolverInputSchema = z.object({
  userId: z.string(),
  question: z.string(),
});

const prompt = ai.definePrompt(
  {
    name: 'doubtSolverPrompt',
    model: 'gemini-2.5-flash', // 👈 fixed model
    input: { schema: DoubtSolverInputSchema },
    output: { schema: z.string() },
    tools: [KnowledgeBaseTool],
    system: `You are "Topper's AI Tutor," a friendly and expert academic assistant for students.
- Always use the 'getRelevantSubjects' tool first to check the website's content.
- If relevant content is found, use it as the primary source in your answer.
- If no content is found, use general knowledge but mention that notes aren't available on the site yet.
- Respond naturally if the question is conversational (e.g., "hello").
- Keep answers clear, encouraging, and easy to understand for students.
- Use Markdown for formatting (lists, **bold text**, etc.).`,
    prompt: `{{#if history}}
This is the chat history so far:
{{#each history}}
{{role}}: {{content}}
{{/each}}
{{/if}}

The user's new question is:
{{{question}}}`,
  },
  async (input) => {
    const history = await getChatHistory(input.userId);
    return {
      history: history.map((msg) => ({
        role: msg.role as 'user' | 'model',
        content: msg.content,
      })),
      question: input.question,
    };
  },
);

/* -----------------------------
 * Flow Definition
 * ----------------------------- */
const doubtSolverFlow = ai.defineFlow(
  {
    name: 'doubtSolverFlow',
    inputSchema: DoubtSolverInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { userId, question } = input;

    // Save user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };
    await saveChatMessage(userId, userMessage);

    // Call the AI prompt
    const result = await prompt(input);

    // Handle both return shapes (string or { output })
    let output: string;
    if (typeof result === 'string') {
      output = result;
    } else if (result && typeof result === 'object' && 'output' in result) {
      output = (result as { output: string }).output;
    } else {
      throw new Error(
        `Unexpected prompt result: ${JSON.stringify(result, null, 2)}`,
      );
    }

    // Save model message
    const modelMessage: ChatMessage = {
      role: 'model',
      content: output,
      timestamp: Date.now(),
    };
    await saveChatMessage(userId, modelMessage);

    return output;
  },
);

/* -----------------------------
 * Exported Function
 * ----------------------------- */
export async function solveDoubt(
  question: string,
  userId: string,
): Promise<string> {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return doubtSolverFlow({ question, userId });
}
