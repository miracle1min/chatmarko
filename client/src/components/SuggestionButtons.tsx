import React from 'react';
import { ImageIcon, Code, GraduationCap, MoreHorizontal } from 'lucide-react';

interface SuggestionButtonsProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function SuggestionButtons({ onSendMessage }: SuggestionButtonsProps) {
  const handleImageClick = () => {
    onSendMessage("Buat gambar pemandangan alam yang indah dengan pantai, gunung, dan matahari terbenam", "image");
  };

  const handleCodeClick = () => {
    onSendMessage("Tolong buatkan contoh kode React component sederhana untuk form login dengan validasi", "text");
  };

  const handleAdviceClick = () => {
    onSendMessage("Berikan saya tips praktis tentang cara meningkatkan produktivitas saat bekerja dari rumah", "text");
  };

  const handleOtherClick = () => {
    onSendMessage("Apa saja fitur yang bisa kamu lakukan?", "text");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      <button 
        onClick={handleImageClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-4 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">Buat gambar</span>
            <p className="text-xs text-gray-500 mt-1">Pemandangan, karakter, konsep, dll.</p>
          </div>
        </div>
      </button>
      
      <button 
        onClick={handleCodeClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-4 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">Bantuan kode</span>
            <p className="text-xs text-gray-500 mt-1">Tulis, debug, atau jelaskan kode</p>
          </div>
        </div>
      </button>
      
      <button 
        onClick={handleAdviceClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-4 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">Dapatkan nasihat</span>
            <p className="text-xs text-gray-500 mt-1">Tips produktivitas & pembelajaran</p>
          </div>
        </div>
      </button>
      
      <button 
        onClick={handleOtherClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-4 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <MoreHorizontal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">Lainnya</span>
            <p className="text-xs text-gray-500 mt-1">Jelajahi lebih banyak kemampuan</p>
          </div>
        </div>
      </button>
    </div>
  );
}
