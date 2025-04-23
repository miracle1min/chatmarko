import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { Message } from '@/types';
import { Share2 } from 'lucide-react';
import { useShareChat } from '@/hooks/useShareChat';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function ChatArea({ messages, isLoading, onSendMessage }: ChatAreaProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Get current chat ID from URL
  const getCurrentChatId = () => {
    const pathParts = window.location.pathname.split('/');
    const potentialId = pathParts[pathParts.length - 1];
    return !isNaN(Number(potentialId)) ? Number(potentialId) : 1; // Default to 1 if no ID found
  };
  
  const { shareChat } = useShareChat();
  
  const handleShare = () => {
    const chatId = getCurrentChatId();
    shareChat(chatId);
  };

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-auto px-3 md:px-4 py-2 md:py-4 bg-dark-900 bg-gradient-to-b from-dark-900 to-dark-900/95"
    >
      {messages.length === 0 ? (
        <WelcomeScreen onSendMessage={onSendMessage} />
      ) : (
        <div className="max-w-3xl mx-auto pt-2 pb-4 relative">
          <div className="absolute right-0 top-0 z-10">
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-full bg-gray-800/70 hover:bg-gray-700/80 text-gray-200 backdrop-blur-sm transition-colors border border-gray-700/30"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Chat</span>
            </button>
          </div>
          
          {messages.map(message => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      )}

      {isLoading && <TypingIndicator />}
    </div>
  );
}