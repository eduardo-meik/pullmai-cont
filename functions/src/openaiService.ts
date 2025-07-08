// functions/src/openaiService.ts
import * as functions from 'firebase-functions';
import OpenAI from 'openai';

// Initialize OpenAI client
let openai: OpenAI | null = null;
const openaiApiKey = functions.config().openai?.key;

if (!openaiApiKey) {
  console.error(
    'OpenAI API key is not set in Firebase environment configuration. ' +
    'Please set with: firebase functions:config:set openai.key="YOUR_KEY"'
  );
} else {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
}

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHAT_COMPLETION_MODEL = 'gpt-4-turbo-preview'; // Or your preferred GPT-4 series model

/**
 * Generates an embedding for the given text using OpenAI.
 * @param text The text to embed.
 * @returns A promise that resolves with the embedding vector.
 * @throws Throws an error if the OpenAI client is not initialized or API call fails.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!openai) {
    throw new Error('OpenAI client is not initialized. Check API key configuration.');
  }

  // Replace newlines with spaces, as recommended by OpenAI for embedding quality
  const inputText = text.replace(/\n/g, ' ');

  try {
    console.log(`Generating embedding for text (first 50 chars): "${inputText.substring(0, 50)}..."`);
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: inputText,
    });
    console.log(`Embedding generated successfully. Dimension: ${embeddingResponse.data[0]?.embedding?.length}`);
    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding from OpenAI:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate text embedding.',
      error
    );
  }
};

/**
 * Gets a chat completion from OpenAI's GPT-4 series model.
 * @param userQuery The user's query.
 * @param context Relevant context retrieved from semantic search.
 * @returns A promise that resolves with the LLM's response text.
 * @throws Throws an error if the OpenAI client is not initialized or API call fails.
 */
export const getChatCompletion = async (
  userQuery: string,
  context: string
): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client is not initialized. Check API key configuration.');
  }

  const systemPrompt = `You are a helpful AI assistant for a contract and project management system.
Answer the user's question based ONLY on the provided context.
If the information is not in the context, explicitly state that you don't have enough information.
Be concise and clear. Cite specific document names or project names if they are mentioned in the context and relevant to the answer.
Do not make up information.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: `Context:\n---\n${context}\n---\nUser Question: ${userQuery}`,
    },
  ];

  try {
    console.log(`Getting chat completion for query: "${userQuery}"`);
    const completionResponse = await openai.chat.completions.create({
      model: CHAT_COMPLETION_MODEL,
      messages: messages,
      temperature: 0.2, // Lower temperature for more factual, less creative responses
      max_tokens: 500, // Adjust as needed
    });

    const responseText = completionResponse.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response text received from OpenAI.');
    }
    console.log('Chat completion received successfully.');
    return responseText;
  } catch (error) {
    console.error('Error getting chat completion from OpenAI:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get chat completion.',
      error
    );
  }
};
