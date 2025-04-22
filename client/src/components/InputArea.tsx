import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InputAreaProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    await onSendMessage(message.trim());
    setMessage('');
    
    // Reset height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-3 pr-16 text-white resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-500"
            placeholder="Tanyakan apa saja"
            style={{ minHeight: '52px', maxHeight: '200px' }}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            size="icon"
            className={`absolute right-3 bottom-2.5 transition-colors p-1.5 rounded-md ${
              message.trim() ? 'text-primary' : 'text-gray-400'
            } hover:text-primary-600`}
            disabled={!message.trim() || isLoading}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
        <div className="text-xs text-center mt-2 text-gray-500">
          ChatMarko dapat membuat kesalahan. Verifikasi informasi penting.
        </div>
      </div>
    </div>
  );
}
