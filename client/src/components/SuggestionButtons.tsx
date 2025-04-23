import React from 'react';
import { ImageIcon, Code, GraduationCap, MoreHorizontal } from 'lucide-react';

interface SuggestionButtonsProps {
  onSendMessage: (content: string, responseType: 'text' | 'image') => Promise<void>;
}

export default function SuggestionButtons({ onSendMessage }: SuggestionButtonsProps) {
  const handleImageClick = () => {
    onSendMessage(
      'Buatkan gambar futuristik kota Jakarta di tahun 2050 dengan transportasi melayang dan gedung-gedung modern',
      'image'
    );
  };

  const handleCodeClick = () => {
    onSendMessage(
      'Tolong buatkan contoh aplikasi React sederhana untuk menampilkan cuaca dengan menggunakan API, sertakan penjelasan kode',
      'text'
    );
  };

  const handleAdviceClick = () => {
    onSendMessage(
      'Berikan saya 5 tips efektif untuk belajar pemrograman dengan cepat dan cara menerapkannya dalam proyek nyata',
      'text'
    );
  };

  const handleOtherClick = () => {
    onSendMessage('Apa saja yang bisa kamu bantu untuk saya? Berikan beberapa contoh pertanyaan yang bisa saya tanyakan', 'text');
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-6 max-w-xl mx-auto">
      <button
        onClick={handleImageClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-3 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-medium text-sm">Buat gambar unik</span>
            <p className="text-xs text-gray-500 mt-0.5">Kota futuristik, fantasi, dll.</p>
          </div>
        </div>
      </button>

      <button
        onClick={handleCodeClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-3 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
            <Code className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-medium text-sm">Bantuan kode</span>
            <p className="text-xs text-gray-500 mt-0.5">React, Python, solusi API, dll.</p>
          </div>
        </div>
      </button>

      <button
        onClick={handleAdviceClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-3 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-medium text-sm">Tips belajar</span>
            <p className="text-xs text-gray-500 mt-0.5">Pemrograman, bahasa, karir teknologi</p>
          </div>
        </div>
      </button>

      <button
        onClick={handleOtherClick}
        className="bg-dark-800 hover:bg-dark-700 transition-all duration-200 rounded-xl p-3 text-left border border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
            <MoreHorizontal className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-medium text-sm">Tanya ChatMarko</span>
            <p className="text-xs text-gray-500 mt-0.5">Jelajahi kemampuan AI asisten</p>
          </div>
        </div>
      </button>
    </div>
  );
}
