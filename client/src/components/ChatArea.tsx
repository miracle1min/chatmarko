import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { Message } from '@/types';

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
  
  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-auto px-4 py-2"
    >
      {messages.length === 0 ? (
        <WelcomeScreen onSendMessage={onSendMessage} />
      ) : (
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      )}
      
      {isLoading && <TypingIndicator />}
    </div>
  );
}
