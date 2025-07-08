// src/Components/Chat/ChatWindow.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessageInterface, ChatAuthUser, ChatMessageReference } from '../../types/chat'; // Adjust path
import ChatMessage from './ChatMessage'; // Adjust path
import ChatInput from './ChatInput'; // Adjust path
// import { getFunctions, httpsCallable } from 'firebase/functions'; // For actual Firebase call
// import { useAuth } from '../../contexts/AuthContext'; // Assuming you have an AuthContext

// Placeholder for the actual Firebase function call
// Replace this with your actual service call
const callAskLlmFunction = async (queryText: string, organizationId: string | undefined): Promise<{ answer: string; references: ChatMessageReference[] }> => {
  console.log(`Simulating call to 'askLlm' with query: "${queryText}" for org: ${organizationId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate a response
  if (queryText.toLowerCase().includes('hello') || queryText.toLowerCase().includes('hi')) {
    return {
      answer: `Hello there! This is a simulated response for organization: ${organizationId}. How can I help you today?`,
      references: [],
    };
  }
  if (queryText.toLowerCase().includes('contract alpha')) {
    return {
      answer: "Contract Alpha is a services agreement effective from 2023-01-01 to 2024-12-31. More details can be found in the document.",
      references: [
        { documentId: 'contract123', collection: 'contratos', displayText: 'Contract Alpha', pdfUrl: 'contracts/orgXYZ/alpha.pdf', pageNumber: 1 },
      ],
    };
  }
  return {
    answer: `I received your query: "${queryText}". I'm a simulation and can't fully process this yet.`,
    references: [
        { documentId: 'doc456', collection: 'proyectos', displayText: 'Project Titan Summary'},
        { documentId: 'user789', collection: 'usuarios', displayText: 'User: John Doe'}
    ],
  };
  // In a real scenario:
  // const functions = getFunctions();
  // const askLlm = httpsCallable(functions, 'askLlm'); // Make sure 'askLlm' is deployed
  // try {
  //   const result = await askLlm({ query: queryText, organizationId: organizationId });
  //   return result.data as { answer: string; references: ChatMessageReference[] };
  // } catch (error) {
  //   console.error("Error calling askLlm function:", error);
  //   throw error; // Re-throw to be caught by handleSendMessage
  // }
};


const ChatWindow: React.FC = () => {
  // const { currentUser } = useAuth(); // Get this from your AuthContext
  // const organizationId = currentUser?.organizationId;
  // Placeholder for user and org ID - replace with your actual auth context logic
  const currentUser: ChatAuthUser | null = { uid: 'testUser123', organizationId: 'orgTestXYZ' };
  const organizationId = currentUser?.organizationId;

  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Optional: Load initial greeting or past messages
  useEffect(() => {
    setMessages([
      {
        id: 'initial-greeting',
        text: 'Hello! I am your AI assistant. How can I help you today?',
        sender: 'llm',
        timestamp: Date.now(),
        references: []
      }
    ]);
  }, []);

  const handleSendMessage = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMessage: ChatMessageInterface = {
      id: `user-${Date.now()}`,
      text: queryText,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      if (!organizationId) {
        throw new Error("User organization ID is not available. Cannot send message.");
      }
      // const result = await chatService.askLlm(queryText, organizationId); // Using a service
      const result = await callAskLlmFunction(queryText, organizationId);


      const llmMessage: ChatMessageInterface = {
        id: `llm-${Date.now()}`,
        text: result.answer,
        sender: 'llm',
        references: result.references || [],
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, llmMessage]);
    } catch (err: any) {
      console.error("Error fetching LLM response:", err);
      const errorMessage = err.message || "Sorry, something went wrong. Please try again.";
      setError(errorMessage);
      // Optionally add an error message to the chat
      const llmError: ChatMessageInterface = {
        id: `error-${Date.now()}`,
        text: `Error: ${errorMessage}`,
        sender: 'llm', // Or a dedicated 'system' sender
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, llmError]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]); // Add organizationId to dependency array

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Message display area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling to bottom */}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 text-center text-sm text-gray-500">
          AI is thinking...
        </div>
      )}

      {/* Error display area */}
      {error && (
        <div className="p-4 bg-red-100 border-t border-red-200 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;
