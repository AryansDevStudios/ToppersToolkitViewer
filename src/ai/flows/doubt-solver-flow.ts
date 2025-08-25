
'use server';
/**
 * @fileOverview An academic doubt solver AI agent for students.
 *
 * - solveDoubt - A function that handles the student's question.
 * - KnowledgeBaseTool - A tool to search the website's content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getChatHistory, saveChatMessage, getAllNotes } from '@/lib/data';
import { ChatMessage } from '@/lib/types';

const KnowledgeBaseTool = ai.defineTool(
    {
        name: 'getRelevantSubjects',
        description: "Searches the website's curriculum to find relevant subjects, sub-subjects, or chapters for a user's academic question.",
        inputSchema: z.object({
            query: z.string().describe("The user's academic question or topic of interest."),
        }),
        outputSchema: z.string().describe("A summary of relevant subjects, sub-subjects, and chapters from the knowledge base, or a message indicating no relevant content was found."),
    },
    async ({ query }) => {
        const notes = await getAllNotes();
        const lowerCaseQuery = query.toLowerCase();

        const relevantNotes = notes.filter(note => 
            note.subjectName.toLowerCase().includes(lowerCaseQuery) ||
            note.subSubjectName.toLowerCase().includes(lowerCaseQuery) ||
            note.chapter.toLowerCase().includes(lowerCaseQuery) ||
            note.type.toLowerCase().includes(lowerCaseQuery)
        );

        if (relevantNotes.length === 0) {
            return "No specific subjects, chapters, or notes matching the query were found in the knowledge base.";
        }

        // Create a concise summary of findings
        const summary = new Set<string>();
        relevantNotes.forEach(note => {
            summary.add(`Subject: ${note.subjectName} -> Sub-Subject: ${note.subSubjectName} -> Chapter: ${note.chapter}`);
        });

        return `Found the following relevant content in the knowledge base:\n- ${Array.from(summary).join('\n- ')}`;
    }
);

const DoubtSolverInputSchema = z.object({
    userId: z.string(),
    question: z.string(),
});

const prompt = ai.definePrompt(
  {
    name: 'doubtSolverPrompt',
    input: { schema: DoubtSolverInputSchema },
    output: { schema: z.string() },
    tools: [KnowledgeBaseTool],
    system: `You are "Topper's AI Tutor," a friendly and expert academic assistant for students. Your purpose is to help solve their doubts clearly and concisely.
- Your primary knowledge source is the information provided by the 'getRelevantSubjects' tool. Always use this tool first to see if there's relevant content on the website before answering.
- If the tool provides relevant subjects, use that information as the primary context for your answer.
- If the user's question is about a topic found within the website's content (as reported by the tool), guide them towards that content. For example: "I found information on that in the 'Motion' chapter of Physics. Here's an explanation... You can find more details in your study materials."
- If the tool finds no relevant content, answer the question using your general knowledge, but mention that specific notes on this topic aren't available on the site yet.
- If the question is conversational (e.g., "hello", "how are you?"), respond naturally and friendly.
- Keep your answers helpful, encouraging, and easy to understand for a student.
- Format your answers using Markdown for better readability (e.g., use lists, bold text).`,
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
    const genkitHistory = history.map(msg => ({ role: msg.role as 'user' | 'model', content: msg.content }));

    return {
      history: genkitHistory,
      question: input.question,
    };
  }
);


const doubtSolverFlow = ai.defineFlow(
    {
        name: 'doubtSolverFlow',
        inputSchema: DoubtSolverInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const { userId, question } = input;
        
        const userMessage: ChatMessage = { role: 'user', content: question, timestamp: Date.now() };
        await saveChatMessage(userId, userMessage);
        
        const result = await prompt(input);
        
        let output: string | undefined;

        if (typeof result?.output === 'string') {
          output = result.output;
        } else if (typeof result === 'string') {
          output = result;
        }

        if (output) {
            const modelMessage: ChatMessage = { role: 'model', content: output, timestamp: Date.now() };
            await saveChatMessage(userId, modelMessage);
            return output;
        }

        return "I'm sorry, I couldn't come up with a response. Please try again.";
    }
);

export async function solveDoubt(question: string, userId: string): Promise<string> {
    if (!userId) {
        throw new Error("User not authenticated");
    }
    return doubtSolverFlow({ question, userId });
}
