import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { copy } = useCopyToClipboard();
  const isUser = message.role === 'user';
  const [showTypingEffect, setShowTypingEffect] = useState(!isUser);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    // Only apply typing effect to non-user messages with text responseType
    if (!isUser && message.responseType === 'text') {
      setShowTypingEffect(true);
      let index = 0;
      const timer = setInterval(() => {
        setDisplayedText(message.content.slice(0, index));
        index++;
        
        if (index > message.content.length) {
          clearInterval(timer);
          setShowTypingEffect(false);
          setDisplayedText(message.content);
        }
      }, 10); // Adjust speed here
      
      return () => clearInterval(timer);
    } else {
      setShowTypingEffect(false);
      setDisplayedText(message.content);
    }
  }, [message, isUser]);
  
  const handleCopy = () => {
    copy(message.content);
  };
  
  const handleDownloadImage = (imageSrc: string) => {
    // Create a link element
    const link = document.createElement('a');
    // Set the download attribute with filename
    const filename = imageSrc.split('/').pop() || 'generated-image.png';
    link.download = filename;
    // Set the href to the image source
    link.href = imageSrc;
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="mt-2 relative image-container">
            <img 
              src={imgSrc} 
              alt="Generated image" 
              className="max-w-full rounded-lg shadow-md generated-image"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Generation+Error";
              }} 
            />
            <button 
              className="download-button"
              onClick={() => handleDownloadImage(imgSrc)}
              title="Download Image"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        );
      }
      
      // Otherwise it's a description of an image, format it nicely
      return (
        <div className="mt-2 p-4 bg-dark-800 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Image Description:</div>
          <div className="text-gray-300">{message.content}</div>
        </div>
      );
    }
    
    // For text messages, render with typing effect
    return (
      <div className={`p-4 rounded-lg ${isUser ? 'bg-user-message' : 'bg-assistant-message'}`}>
        <div className="text-gray-300">
          {showTypingEffect ? (
            displayedText
          ) : (
            message.content
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="mb-6 message-animation">
      <div className="flex items-start">
        <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${
          isUser ? 'bg-gray-700' : 'bg-primary'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center mb-2">
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
          
          {!isUser && !showTypingEffect && (
            <div className="mt-3 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-transparent" 
                onClick={handleCopy}
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-transparent" 
                title="Like"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-transparent" 
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
