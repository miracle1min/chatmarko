import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start mb-6 ml-4">
        <div>
          <div className="font-medium mb-2">
            ChatMarko sedang mengetik
            <span className="dot-typing"></span>
          </div>
          <div className="space-y-2">
            <div className="bg-dark-800 animate-pulse h-4 w-32 rounded"></div>
            <div className="bg-dark-800 animate-pulse h-4 w-56 rounded"></div>
            <div className="bg-dark-800 animate-pulse h-4 w-40 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
