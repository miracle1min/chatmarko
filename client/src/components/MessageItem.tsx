import React from 'react';
import { Message } from '@/types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { copy } = useCopyToClipboard();
  const isUser = message.role === 'user';
  
  const handleCopy = () => {
    copy(message.content);
  };
  
  const renderContent = () => {
    if (message.responseType === 'image') {
      // Check if content starts with '/'
      const imgSrc = message.content.startsWith('/') 
        ? message.content  // It's a path to an image file
        : null;  // It's a text description
      
      // If we have an image path, render it
      if (imgSrc) {
        return (
          <div className="mt-2">
            <img 
              src={imgSrc} 
              alt="Generated image" 
              className="max-w-full rounded-md"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Generation+Error";
              }} 
            />
          </div>
        );
      }
      
      // Otherwise it's a description of an image, format it nicely
      return (
        <div className="mt-2 p-3 bg-dark-800 rounded-md border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Image Description:</div>
          <div className="text-gray-300">{message.content}</div>
        </div>
      );
    }
    
    // For text messages, render as regular text (could be enhanced with markdown)
    return <div className="text-gray-300">{message.content}</div>;
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-start mb-1">
        <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${
          isUser ? 'bg-gray-700' : 'bg-primary'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <div className="font-medium mr-2">
              {isUser ? 'Anda' : 'ChatMarko'}
            </div>
            
            {!isUser && (
              <div className="text-xs text-gray-400">
                {message.model === 'mistral' ? 'Mistral AI' : 'Gemini'}
              </div>
            )}
          </div>
          
          {renderContent()}
          
          {!isUser && (
            <div className="mt-3 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white" 
                onClick={handleCopy}
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white" 
                title="Like"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white" 
                title="Dislike"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
