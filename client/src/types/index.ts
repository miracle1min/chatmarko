export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  model: 'mistral' | 'gemini';
  createdAt: string;
  responseType: 'text' | 'image';
}

export interface Chat {
  id: number;
  title: string;
  createdAt: string;
}

export interface NewChatRequest {
  title: string;
  userId?: number;
}

export interface NewMessageRequest {
  chatId: number;
  content: string;
  role: 'user' | 'assistant';
  model: 'mistral' | 'gemini';
  responseType: 'text' | 'image';
}

export interface ChatWithMessages {
  chat: Chat;
  messages: Message[];
}

export interface MessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface ChatContextType {
  chats: Chat[];
  currentChat: ChatWithMessages | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
  createNewChat: () => Promise<void>;
  loadChat: (chatId: number) => Promise<void>;
  loadChats: () => Promise<void>;
}
