import React from 'react';
import SuggestionButtons from './SuggestionButtons';
import { Button } from '@/components/ui/button';
import { Plus, Bot } from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="max-w-2xl mx-auto py-6 md:py-12 text-center px-3">
      <div className="flex justify-center mb-6">
        <div className="bg-primary rounded-full h-16 w-16 flex items-center justify-center">
          <Bot className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-3">ChatMarko</h1>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        AI Chat Assistant berbasis Mistral dan Gemini yang dapat membantu untuk chat dan membuat gambar
      </p>
      
      <SuggestionButtons onSendMessage={onSendMessage} />
      
      <div className="mt-10 mb-6">
        <div className="text-sm text-gray-500 mb-3 flex items-center justify-center">
          <div className="w-12 h-px bg-gray-800 mr-3"></div>
          <span>Upgrade ke ChatMarko Plus</span>
          <div className="w-12 h-px bg-gray-800 ml-3"></div>
        </div>
        <Button 
          variant="outline" 
          className="bg-dark-800 hover:bg-dark-700 text-white border-gray-700 flex items-center shadow-lg"
        >
          <span>Dapatkan Plus</span>
          <Plus className="ml-2 w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
