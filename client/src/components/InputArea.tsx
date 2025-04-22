import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface InputAreaProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'image'>('text');
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
    
    await onSendMessage(message.trim(), responseType);
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

  const getPlaceholder = () => {
    if (responseType === 'image') {
      return 'Deskripsikan gambar yang ingin dibuat...';
    }
    return 'Tanyakan apa saja';
  };

  return (
    <div className="sticky bottom-0 z-10 p-3 md:p-4 border-t border-gray-700 bg-dark-800 backdrop-blur-md">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-2">
          <ToggleGroup 
            type="single" 
            value={responseType}
            onValueChange={(value) => {
              if (value) setResponseType(value as 'text' | 'image');
            }}
            className="bg-dark-900 border border-gray-700 rounded-full p-1"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="text" 
                    aria-label="Text mode" 
                    className="rounded-full data-[state=on]:bg-dark-700 data-[state=on]:text-primary"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-xs">Teks</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Chat dengan AI (Mistral)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="image" 
                    aria-label="Image generation mode" 
                    className="rounded-full data-[state=on]:bg-dark-700 data-[state=on]:text-primary"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    <span className="text-xs">Gambar</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Buat gambar (Gemini)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </ToggleGroup>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-dark-900 border border-gray-700 rounded-lg px-4 py-3 pr-14 text-white resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-500 ${
              responseType === 'image' ? 'border-primary/30' : ''
            }`}
            placeholder={getPlaceholder()}
            style={{ minHeight: '52px', maxHeight: '200px' }}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            className={`absolute right-3 bottom-2.5 transition-all p-1.5 rounded-full border-none outline-none bg-transparent ${
              message.trim() ? 'text-primary opacity-100 scale-100' : 'text-gray-400 opacity-70 scale-95'
            } hover:text-primary-600 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={!message.trim() || isLoading}
          >
            <SendIcon className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2 mt-2">
          {responseType === 'image' && (
            <div className="flex items-center text-xs text-primary animate-pulse">
              <ImageIcon className="h-3 w-3 mr-1" />
              <span>Mode gambar aktif</span>
            </div>
          )}
        </div>

        <div className="text-xs text-center mt-1 text-gray-500">
          ChatMarko dapat membuat kesalahan. Verifikasi informasi penting.
        </div>
      </div>
    </div>
  );
}
