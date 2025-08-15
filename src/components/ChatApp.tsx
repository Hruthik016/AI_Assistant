import React, { useState } from 'react';
import { useUserData } from '@nhost/react';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';

export const ChatApp: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const user = useUserData();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <Sidebar 
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
      />
      <ChatWindow 
        chatId={selectedChatId}
        userId={user.id}
      />
    </div>
  );
};