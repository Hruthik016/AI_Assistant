import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useUserData, useSignOut } from '@nhost/react';
import { Plus, MessageSquare, LogOut, User } from 'lucide-react';
import { Chat } from '../types';
import { CREATE_CHAT, GET_USER_CHATS } from '../graphql/queries';

interface SidebarProps {
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedChatId, onChatSelect }) => {
  const user = useUserData();
  const { signOut } = useSignOut();

  const { data, loading, refetch } = useQuery(GET_USER_CHATS, {
    variables: { user_id: user?.id || '' },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    pollInterval: 5000, // Poll every 5 seconds for updates
  });

  const [createChat, { loading: creatingChat }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      if (data.insert_chats_one) {
        onChatSelect(data.insert_chats_one.id);
        refetch();
      }
    },
    onError: (error) => {
      console.error('Error creating chat:', error);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
    }
  });

  const handleNewChat = async () => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    console.log('Creating chat for user:', user.id);

    try {
      await createChat({
        variables: { user_id: user.id }
      });
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  const getPreviewText = (messages: any[]): string => {
    if (!messages || messages.length === 0) return 'New chat';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.length > 50
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const chats: Chat[] = data?.chats || [];

  // Debug logging
  console.log('Sidebar Debug - User ID:', user?.id);
  console.log('Sidebar Debug - Query data:', data);
  console.log('Sidebar Debug - Chats array:', chats);
  console.log('Sidebar Debug - Loading:', loading);
  console.log('Sidebar Debug - Chats length:', chats.length);

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-semibold">AI Assistant - Chatbot</h1>
        </div>

        <button
          onClick={handleNewChat}
          disabled={creatingChat}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{creatingChat ? 'Creating...' : 'New Chat'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No chats yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedChatId === chat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getPreviewText(chat.messages || [])}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(chat.updated_at || chat.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-32">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};