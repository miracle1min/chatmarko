import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Chat, Message, NewChatRequest, NewMessageRequest, MessageResponse, ChatWithMessages } from '@/types';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chats', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chats');
      }
      
      const data = await response.json();
      setChats(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading chats';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadChat = useCallback(async (chatId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/${chatId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chat');
      }
      
      const data: ChatWithMessages = await response.json();
      setCurrentChat(data);
      setMessages(data.messages);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading chat';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const newChatData: NewChatRequest = {
        title: 'New Chat',
      };
      
      const response = await apiRequest('POST', '/api/chat', newChatData);
      
      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }
      
      const newChat: Chat = await response.json();
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChat({ chat: newChat, messages: [] });
      setMessages([]);
      
      return newChat;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating chat';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendMessage = useCallback(async (content: string, responseType: 'text' | 'image' = 'text') => {
    try {
      setIsLoading(true);
      
      // Jika tidak ada chat aktif, buat chat baru terlebih dahulu
      let chatToUse = currentChat;
      let chatId: number;
      
      if (!chatToUse) {
        const newChat = await createNewChat();
        if (!newChat) {
          throw new Error('Failed to create a new chat for your message');
        }
        chatId = newChat.id;
      } else {
        chatId = chatToUse.chat.id;
      }
      
      const messageData: NewMessageRequest = {
        chatId,
        content,
        role: 'user',
        model: responseType === 'text' ? 'mistral' : 'gemini',
        responseType,
      };
      
      // Optimistically update UI with the user message
      const tempUserMessage: Message = {
        id: Date.now(), // Temporary ID
        content,
        role: 'user',
        model: responseType === 'text' ? 'mistral' : 'gemini',
        createdAt: new Date().toISOString(),
        responseType,
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      
      const response = await apiRequest('POST', '/api/chat/message', messageData);
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data: MessageResponse = await response.json();
      
      // Update with the actual messages from the server
      setMessages(prev => 
        prev
          .filter(msg => msg.id !== tempUserMessage.id)
          .concat([data.userMessage, data.assistantMessage])
      );
      
      // Update chat title after first message if it's a new chat
      if (currentChat && messages.length === 0 && currentChat.chat.title === 'New Chat') {
        // In a real app, you might want to update the chat title based on the conversation
        const updatedChat = { ...currentChat.chat, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') };
        setCurrentChat({ ...currentChat, chat: updatedChat });
        
        // You'd also update this on the server, but we'll skip that for now
        // await apiRequest('PATCH', `/api/chat/${chatId}`, { title: updatedChat.title });
        
        // Update in the chats list
        setChats(prev => prev.map(chat => 
          chat.id === chatId ? updatedChat : chat
        ));
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending message';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [createNewChat, currentChat, messages, toast]);

  return {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    sendMessage,
    createNewChat,
    loadChat,
    loadChats,
  };
}