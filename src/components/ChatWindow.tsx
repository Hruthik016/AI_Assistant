import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Send, Bot, User, Copy, Check } from 'lucide-react';
import { GET_CHAT_MESSAGES, INSERT_MESSAGE, UPDATE_CHAT_TIMESTAMP, SEND_MESSAGE_TO_BOT } from '../graphql/queries';
import { Message } from '../types';

interface ChatWindowProps {
  chatId: string | null;
  userId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, userId }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId,
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    onError: (error) => {
      console.error('Error inserting message:', error);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
    }
  });
  
  const [updateChatTimestamp] = useMutation(UPDATE_CHAT_TIMESTAMP, {
    onError: (error) => {
      console.error('Error updating chat timestamp:', error);
    }
  });
  
  const [sendMessageToBot] = useMutation(SEND_MESSAGE_TO_BOT, {
    onError: (error) => {
      console.error('Error sending message to bot:', error);
    }
  });

  const messages: Message[] = data?.messages || [];

  // Debug logging
  console.log('Chat ID:', chatId);
  console.log('Messages data:', data);
  console.log('Messages:', messages);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatId || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    console.log('Sending message:', userMessage, 'to chat:', chatId);

    try {
      // 1. Insert user message
      const userMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: userMessage,
          sender_type: 'user',
        },
      });
      
      console.log('User message inserted:', userMessageResult);

      // 2. Update chat timestamp
      const timestampResult = await updateChatTimestamp({ 
        variables: { chat_id: chatId } 
      });
      
      console.log('Chat timestamp updated:', timestampResult);

      // 3. Send message to bot
      const botResult = await sendMessageToBot({
        variables: {
          chat_id: chatId,
          content: userMessage,
        },
      });

      // Log the bot response for debugging
      console.log('Bot response:', botResult.data?.sendMessageToBot);

      // If bot response is successful and has a message, insert it as bot message
      if (botResult.data?.sendMessageToBot?.success && botResult.data?.sendMessageToBot?.message) {
        // Handle array response - extract message from first element
        const responseMessage = botResult.data.sendMessageToBot.message;
        const botMessage = Array.isArray(responseMessage) 
          ? responseMessage[0]?.message || 'No message received'
          : responseMessage.message || responseMessage;

        const botMessageResult = await insertMessage({
          variables: {
            chat_id: chatId,
            content: botMessage,
            sender_type: 'bot',
          },
        });
        
        console.log('Bot message inserted:', botMessageResult);
      } else {
        // If bot request failed, show error message as bot response
        const errorMessage = botResult.data?.sendMessageToBot?.message 
          ? JSON.stringify(botResult.data.sendMessageToBot.message, null, 2)
          : 'Sorry, I encountered an error processing your message.';
        
        const errorMessageResult = await insertMessage({
          variables: {
            chat_id: chatId,
            content: errorMessage,
            sender_type: 'bot',
          },
        });
        
        console.log('Error message inserted:', errorMessageResult);
      }

      // 4. Update chat timestamp again
      await updateChatTimestamp({ 
        variables: { chat_id: chatId } 
      });

      // 5. Refetch messages to get bot response
      const refetchResult = await refetch();
      console.log('Messages refetched:', refetchResult);
      
      // 6. Trigger sidebar refresh by refetching parent component
      // This will be handled by polling in sidebar
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Welcome to AI Assistant</h2>
          <p className="text-gray-500">Select a chat or create a new one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Assistant</h2>
            <p className="text-sm text-gray-400">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
        {/* Geometric pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 35%, rgba(59, 130, 246, 0.1) 35%, rgba(59, 130, 246, 0.1) 65%, transparent 65%),
              linear-gradient(-45deg, transparent 35%, rgba(59, 130, 246, 0.05) 35%, rgba(59, 130, 246, 0.05) 65%, transparent 65%)
            `,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">Start your conversation</p>
            <p className="text-sm text-gray-500">Type a message below to begin chatting with the AI</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender_type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {message.sender_type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`flex-1 max-w-2xl ${message.sender_type === 'user' ? 'flex justify-end' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-2xl inline-block max-w-full ${
                    message.sender_type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
                  } group relative`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </span>
                    {message.sender_type === 'bot' && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 rounded-bl-md inline-block">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all resize-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isProcessing}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send your message
        </p>
      </div>
    </div>
  );
};