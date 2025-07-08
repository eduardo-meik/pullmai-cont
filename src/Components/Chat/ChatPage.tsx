// src/Components/Chat/ChatPage.tsx
import React from 'react';
import ChatWindow from './ChatWindow'; // Adjust path as needed

const ChatPage: React.FC = () => {
  return (
    // This outer div attempts to make the chat page take full height.
    // You might need to ensure parent elements also allow for this height.
    // For example, if this is rendered inside a layout with fixed header/sidebar,
    // the 'h-screen' might need adjustment or be applied to the main content area
    // of that layout.
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Optional: You could add a specific header for the chat page here */}
      {/* <header className="bg-white shadow p-4">
        <h1 className="text-xl font-semibold text-gray-800">AI Chat Assistant</h1>
      </header> */}

      {/* The ChatWindow will take up the available space */}
      <div className="flex-grow flex flex-col min-h-0"> {/* min-h-0 is important for flex-grow in nested flex containers */}
        <ChatWindow />
      </div>

      {/* Optional: You could add a specific footer for the chat page here */}
    </div>
  );
};

export default ChatPage;
