export interface Message {
  id: string;
  chat_id: string;
  content: string;
  sender_type: 'user' | 'bot';
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  messages: Message[];
}

export interface SendMessageToBotResponse {
  success: boolean;
  message?: string;
  error?: string;
}