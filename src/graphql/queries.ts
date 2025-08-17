import { gql } from '@apollo/client';

// Create a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat($user_id: uuid!) {
    insert_chats_one(object: { user_id: $user_id }) {
      id
      user_id
      created_at
      updated_at
    }
  }
`;

// Insert a message
export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $content: String!, $sender_type: String!) {
    insert_messages_one(object: { 
      chat_id: $chat_id, 
      content: $content, 
      sender_type: $sender_type 
    }) {
      id
      chat_id
      content
      sender_type
      created_at
    }
  }
`;

// Send message to bot
export const SEND_MESSAGE_TO_BOT = gql`
  mutation SendMessageToBot($chat_id: uuid!, $content: String!) {
    sendMessageToBot(chat_id: $chat_id, content: $content) {
      success
      message
    }
  }
`;

// Update chat timestamp
export const UPDATE_CHAT_TIMESTAMP = gql`
  mutation UpdateChatTimestamp($chat_id: uuid!) {
    update_chats_by_pk(pk_columns: { id: $chat_id }, _set: { updated_at: "now()" }) {
      id
      updated_at
    }
  }
`;

// Get all chats for a user with messages
export const GET_USER_CHATS = gql`
  query GetUserChats($user_id: uuid!) {
    chats(
      where: { user_id: { _eq: $user_id } }, 
      order_by: { updated_at: desc }
    ) {
      id
      user_id
      created_at
      updated_at
      messages(order_by: { created_at: asc }) {
        id
        chat_id
        content
        sender_type
        created_at
      }
    }
  }
`;

// Get messages for a specific chat
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } },
      order_by: { created_at: asc }
    ) {
      id
      chat_id
      content
      sender_type
      created_at
    }
  }
`;