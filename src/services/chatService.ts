// src/services/chatService.ts
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { ChatMessageReference } from '../types/chat'; // Adjust path as needed

// Define the expected request payload for the 'askLlm' function
interface AskLlmRequestData {
  query: string;
  organizationId: string;
  // Optional: conversationId for multi-turn context
  // conversationId?: string;
}

// Define the expected response structure from the 'askLlm' function
export interface AskLlmResponseData {
  answer: string;
  references: ChatMessageReference[];
  // Optional: conversationId if the backend generates/returns it
  // conversationId?: string;
}

/**
 * Calls the 'askLlm' Firebase Function.
 *
 * @param queryText The user's query.
 * @param organizationId The ID of the user's organization.
 * @returns A promise that resolves with the LLM's answer and references.
 * @throws Will throw an error if the function call fails or returns an error.
 */
export const askLlm = async (
  queryText: string,
  organizationId: string
  // conversationId?: string // Optional for multi-turn
): Promise<AskLlmResponseData> => {
  const functions = getFunctions(); // Assumes Firebase app is initialized

  // Ensure 'askLlm' matches the deployed Firebase Function name
  const callableAskLlm = httpsCallable<AskLlmRequestData, AskLlmResponseData>(functions, 'askLlm');

  try {
    console.log(`Calling 'askLlm' Firebase Function with query: "${queryText}", orgId: ${organizationId}`);
    const result: HttpsCallableResult<AskLlmResponseData> = await callableAskLlm({
      query: queryText,
      organizationId: organizationId,
      // conversationId: conversationId // Pass if using
    });

    // The data property of the result contains the value returned by the function
    // Type assertion is safe here if the backend function guarantees this structure on success
    return result.data;
  } catch (error: any) {
    console.error("Error calling 'askLlm' Firebase Function:", error);
    // Enhance error reporting if needed (e.g., distinguish between network errors and function errors)
    // The error object from Firebase Functions might have `code`, `message`, `details`
    const errorMessage = error.message || "An unknown error occurred while contacting the AI assistant.";
    throw new Error(errorMessage); // Re-throw a new error or the original error
  }
};

// Example of how this might be used in a component:
//
// import { askLlm } from './chatService';
//
// const handleUserQuery = async (query: string, orgId: string) => {
//   setIsLoading(true);
//   try {
//     const response = await askLlm(query, orgId);
//     // Update chat with response.answer and response.references
//   } catch (error) {
//     // Display error to user
//     console.error(error);
//   } finally {
//     setIsLoading(false);
//   }
// };
