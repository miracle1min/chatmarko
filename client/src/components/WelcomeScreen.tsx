import React from 'react';
import SuggestionButtons from './SuggestionButtons';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="max-w-2xl mx-auto py-6 md:py-12 text-center px-3">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Selamat Datang di ChatMarko!</h1>
      <p className="text-gray-400 mb-4 max-w-lg mx-auto">
        Halo! Saya asisten AI yang siap membantu Anda dengan berbagai pertanyaan dan membuat gambar menarik sesuai keinginan Anda.
      </p>
      <p className="text-gray-400 mb-6 max-w-lg mx-auto">
        Apa yang ingin Anda tanyakan atau gambar apa yang ingin Anda buat hari ini?
      </p>

      <SuggestionButtons onSendMessage={onSendMessage} />

      <div className="mt-10 mb-6">
        <div className="text-sm text-gray-500 mb-3 flex items-center justify-center">
          <div className="w-12 h-px bg-gray-800 mr-3"></div>
          <span>Tingkatkan Pengalaman Anda</span>
          <div className="w-12 h-px bg-gray-800 ml-3"></div>
        </div>
        <p className="text-gray-400 mb-4 max-w-lg mx-auto text-sm">
          Dapatkan fitur premium seperti generasi gambar resolusi tinggi, prioritas respons, dan model AI terbaru
        </p>
        <Button
          variant="outline"
          className="bg-dark-800 hover:bg-dark-700 text-white border-gray-700 flex items-center shadow-lg"
        >
          <span>Upgrade ke ChatMarko Plus</span>
          <Plus className="ml-2 w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
