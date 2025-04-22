import React from 'react';
import { ImageIcon, Code, GraduationCap, MoreHorizontal } from 'lucide-react';

interface SuggestionButtonsProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function SuggestionButtons({ onSendMessage }: SuggestionButtonsProps) {
  const handleImageClick = () => {
    onSendMessage("Buat gambar pemandangan alam yang indah", "image");
  };

  const handleCodeClick = () => {
    onSendMessage("Tolong buatkan contoh kode React component sederhana", "text");
  };

  const handleAdviceClick = () => {
    onSendMessage("Berikan saya nasihat tentang cara meningkatkan produktivitas", "text");
  };

  const handleOtherClick = () => {
    onSendMessage("Apa yang bisa kamu lakukan?", "text");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      <button 
        onClick={handleImageClick}
        className="bg-dark-800 hover:bg-dark-700 transition-colors duration-200 rounded-xl p-4 text-left"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-900/30 rounded-full flex items-center justify-center mr-3">
            <ImageIcon className="h-4 w-4 text-green-500" />
          </div>
          <span>Buat gambar</span>
        </div>
      </button>
      
      <button 
        onClick={handleCodeClick}
        className="bg-dark-800 hover:bg-dark-700 transition-colors duration-200 rounded-xl p-4 text-left"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
            <Code className="h-4 w-4 text-blue-500" />
          </div>
          <span>Kode</span>
        </div>
      </button>
      
      <button 
        onClick={handleAdviceClick}
        className="bg-dark-800 hover:bg-dark-700 transition-colors duration-200 rounded-xl p-4 text-left"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </div>
          <span>Dapatkan nasihat</span>
        </div>
      </button>
      
      <button 
        onClick={handleOtherClick}
        className="bg-dark-800 hover:bg-dark-700 transition-colors duration-200 rounded-xl p-4 text-left"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center mr-3">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </div>
          <span>Lainnya</span>
        </div>
      </button>
    </div>
  );
}
