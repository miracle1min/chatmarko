import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputArea from '@/components/InputArea';
import MobileNav from '@/components/MobileNav';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const {
    chats,
    currentChat,
    messages,
    isLoading,
    sendMessage,
    createNewChat,
    loadChat,
    loadChats,
  } = useChat();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleSendMessage = async (content: string, responseType: 'text' | 'image' = 'text') => {
    await sendMessage(content, responseType);
  };
  
  // Wrapper functions that return void to match the component prop types
  const handleCreateNewChat = async () => {
    await createNewChat();
  };
  
  const handleLoadChat = async (chatId: number) => {
    await loadChat(chatId);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar 
        chats={chats} 
        onNewChat={handleCreateNewChat} 
        onSelectChat={handleLoadChat}
        currentChatId={currentChat?.chat.id}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNav 
          chats={chats} 
          onNewChat={handleCreateNewChat} 
          onSelectChat={handleLoadChat}
          currentChatId={currentChat?.chat.id}
        />
        
        {/* Chat Area */}
        <ChatArea 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={handleSendMessage}
        />
        
        {/* Input Area */}
        <InputArea 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
