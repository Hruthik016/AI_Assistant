import React, { useState } from 'react';
import { useUserData } from '@nhost/react';
import { useQuery } from '@apollo/client';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import { GET_USER_CHATS } from '../graphql/queries';

export const ChatApp: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const user = useUserData();

  // Force refresh function that can be passed down to components
  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
        refreshTrigger={refreshTrigger}
      />
      <ChatWindow 
        chatId={selectedChatId}
        userId={user.id}
        onMessageSent={forceRefresh}
      />
    </div>
  );
};