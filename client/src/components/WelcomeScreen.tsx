import React from 'react';
import SuggestionButtons from './SuggestionButtons';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="max-w-2xl mx-auto my-8 text-center">
      <h1 className="text-2xl font-bold mb-2">Apa yang bisa saya bantu?</h1>
      
      <SuggestionButtons onSendMessage={onSendMessage} />
      
      <div className="mt-8">
        <div className="text-sm text-muted-foreground mb-3">
          Upgrade ke ChatMarko Plus
        </div>
        <Button 
          variant="outline" 
          className="bg-dark-800 hover:bg-dark-700 text-white border-gray-700 flex items-center"
        >
          <span>Dapatkan Plus</span>
          <Plus className="ml-2 w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
