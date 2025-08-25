
'use server';

import { ai } from '@/ai/genkit';
import { getAllNotes, getChatHistory, saveChatMessage } from '@/lib/data';
import { z } from 'zod';
import type { ChatMessage } from '@/lib/types';
import { googleAI } from '@genkit-ai/googleai';

// Define the tool for searching the knowledge base
const KnowledgeBaseTool = ai.defineTool(
  {
    name: 'knowledgeBaseSearch',
    description: 'Search the knowledge base for information on a given topic. Use this tool first to find relevant context before answering a question.',
    inputSchema: z.object({
      query: z.string().describe('The topic or question to search for in the notes.'),
    }),
    outputSchema: z.string().describe('A summary of the relevant information found, or a message indicating no information was found.'),
  },
  async (input) => {
    console.log(`[KnowledgeBaseTool] Searching for: ${input.query}`);
    const notes = await getAllNotes();
    const query = input.query.toLowerCase();
    
    // A simple text search implementation
    const relevantNotes = notes
      .filter(note => 
        note.type.toLowerCase().includes(query) ||
        note.chapter.toLowerCase().includes(query) ||
        note.subSubjectName.toLowerCase().includes(query) ||
        note.subjectName.toLowerCase().includes(query)
      )
      .map(note => `- ${note.type} in chapter "${note.chapter}" (Subject: ${note.subjectName} > ${note.subSubjectName})`)
      .slice(0, 10); // Limit context size

    if (relevantNotes.length > 0) {
      const context = `Found the following relevant notes:\n${relevantNotes.join('\n')}`;
      console.log(`[KnowledgeBaseTool] Found context:\n${context}`);
      return context;
    } else {
      console.log(`[KnowledgeBaseTool] No relevant notes found for: ${input.query}`);
      return "No specific information found in the knowledge base for this query. Answer based on general knowledge.";
    }
  }
);


// Define the main prompt for the doubt solver
const doubtSolverPrompt = ai.definePrompt(
  {
    name: 'doubtSolverPrompt',
    tools: [KnowledgeBaseTool],
    model: googleAI('gemini-1.5-flash'),
    system: `
      You are a friendly and helpful AI assistant for a student platform called "Topper's Toolkit".
      Your primary role is to answer student's questions based on the notes available in the knowledge base.

      Here's how you should operate:
      1. ALWAYS use the 'knowledgeBaseSearch' tool first to find relevant information about the user's question.
      2. Use the information returned by the tool as the primary context for your answer.
      3. If the tool finds relevant notes, base your answer on that information and mention that you found it in their notes.
      4. If the tool returns no specific information, inform the user that you couldn't find anything in their notes and then provide a general answer.
      5. Keep your answers concise, clear, and easy to understand for a student.
      6. If the user asks a question unrelated to academics, politely decline to answer and guide them back to study-related topics.
      7. Format your responses using Markdown for better readability (e.g., use lists, bold text).
    `,
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

  // 2. Get the updated conversation history
  const history = await getChatHistory(userId);

  // 3. Generate the AI's response
  try {
    const promptInput = {
      history: history.map(msg => ({ role: msg.role, content: [{ text: msg.content }] })),
      question,
    };
    
    // Call the prompt and get the response
    const response = await doubtSolverPrompt(promptInput);
    const output = response.output(); 

    if (!output) {
      throw new Error("The model did not return a valid response.");
    }
    
    // 4. Save the model's response
    const modelMessage: ChatMessage = { role: 'model', content: output, timestamp: Date.now() };
    await saveChatMessage(userId, modelMessage);

  } catch (error: any) {
    console.error(`[solveDoubt] Error generating response for user ${userId}:`, error);
    // Save an error message to the chat so the user sees it
    const errorMessage: ChatMessage = {
      role: 'model',
      content: `I apologize, but I encountered an error while trying to generate a response. Details: ${error.message}`,
      timestamp: Date.now(),
    };
    await saveChatMessage(userId, errorMessage);
    throw error; // Re-throw so client knows it failed
  }

  // 5. Return the final, complete chat history
  return getChatHistory(userId);
}
