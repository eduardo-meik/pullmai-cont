// src/Components/Chat/ChatMessage.tsx
import React from 'react';
import { ChatMessageInterface } from '../../types/chat'; // Adjust path as needed
import SourceReference from './SourceReference'; // Adjust path as needed

interface ChatMessageProps {
  message: ChatMessageInterface;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Base classes for all message bubbles
  const bubbleBaseClasses = "px-4 py-2 rounded-lg max-w-[85%] sm:max-w-[75%] md:max-w-[70%] break-words";
  // Specific classes for user messages
  const userBubbleClasses = "bg-blue-500 text-white";
  // Specific classes for LLM messages
  const llmBubbleClasses = "bg-gray-200 text-gray-800";

  // Base classes for the message row
  const rowBaseClasses = "flex mb-3";
  // Specific classes for user message rows (align right)
  const userRowClasses = "justify-end";
  // Specific classes for LLM message rows (align left)
  const llmRowClasses = "justify-start";

  // Placeholder for sender avatar/icon - you can enhance this
  const renderAvatar = () => {
    // Simple initials or icons for now
    const avatarClasses = "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold";
    if (isUser) {
      return (
        <div className={`${avatarClasses} bg-blue-500 ml-2 order-2`}>
          {/* U (User) - Replace with actual user initials or avatar image */}
          U
        </div>
      );
    } else {
      return (
        <div className={`${avatarClasses} bg-gray-400 mr-2 order-1`}>
          {/* AI - Replace with your bot's icon or avatar */}
          AI
        </div>
      );
    }
  };

  return (
    <div className={`${rowBaseClasses} ${isUser ? userRowClasses : llmRowClasses}`}>
      {!isUser && renderAvatar()} {/* LLM avatar on the left */}
      <div
        className={`${bubbleBaseClasses} ${isUser ? userBubbleClasses : llmBubbleClasses} ${isUser ? 'order-1' : 'order-2'}`}
      >
        {/* Render message text. Consider using a library like 'react-markdown' if LLM can return markdown */}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>

        {message.sender === 'llm' && message.references && message.references.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300/50">
            <p className="text-xs text-gray-600 mb-1">Sources:</p>
            <div className="flex flex-wrap">
              {message.references.map((ref, index) => (
                <SourceReference key={`${message.id}-ref-${index}`} reference={ref} />
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && renderAvatar()} {/* User avatar on the right */}
    </div>
  );
};

export default ChatMessage;
