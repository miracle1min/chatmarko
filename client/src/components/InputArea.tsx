import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, MessageSquare, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface InputAreaProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
  isLoading: boolean;
  onStopGenerating?: () => void;
  isCancelling?: boolean;
}

export default function InputArea({ onSendMessage, isLoading, onStopGenerating, isCancelling = false }: InputAreaProps) {
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
    <div className="sticky bottom-0 z-10 py-3 md:py-4 px-4 md:px-5 border-t border-gray-800/70 bg-gradient-to-t from-dark-900 to-dark-800 backdrop-blur-md shadow-lg">
      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center absolute left-4 top-1/2 transform -translate-y-1/2 space-x-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setResponseType(responseType === 'text' ? 'image' : 'text')}
                    className={`h-8 w-8 p-0 rounded-full flex items-center justify-center ${
                      responseType === 'image' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    {responseType === 'text' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{responseType === 'text' ? 'Beralih ke mode gambar' : 'Beralih ke mode teks'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-gray-900 border ${
              responseType === 'image' 
                ? 'border-primary/40 placeholder-primary/70' 
                : 'border-gray-700/50 placeholder-gray-400'
            } rounded-xl pl-16 pr-14 py-3.5 text-white resize-none focus:outline-none focus:ring-1 focus:ring-primary shadow-md`}
            placeholder={getPlaceholder()}
            style={{ minHeight: '54px', maxHeight: '200px' }}
            disabled={isLoading}
          />

          <div className="absolute right-3 bottom-2.5">
            <button
              type="submit"
              className={`transition-all p-2 rounded-full border-none outline-none ${
                message.trim()
                  ? 'bg-primary text-white opacity-100 scale-100'
                  : 'bg-gray-800 text-gray-400 opacity-70 scale-95'
              } hover:bg-primary-600 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={!message.trim() || isLoading}
            >
              <SendIcon className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center mt-2.5 h-8">
          {isLoading && onStopGenerating && (
            <button
              onClick={onStopGenerating}
              className="py-1.5 px-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center transition-all hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCancelling}
            >
              <StopCircle className="h-3 w-3 mr-1.5" />
              <span>{isCancelling ? 'Membatalkan...' : 'Hentikan Generasi'}</span>
            </button>
          )}
          
          {!isLoading && responseType === 'image' && (
            <div className="py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex items-center">
              <ImageIcon className="h-3 w-3 mr-1.5" />
              <span>Mode Generasi Gambar</span>
            </div>
          )}
        </div>

        <div className="text-xs flex items-center justify-center mt-1.5">
          <span className="text-gray-500 py-1 px-2 rounded-full bg-gray-900/50 backdrop-blur-sm">
            ChatMarko dapat membuat kesalahan. Verifikasi informasi penting.
          </span>
        </div>
      </div>
    </div>
  );
}
