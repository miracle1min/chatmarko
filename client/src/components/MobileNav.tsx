import React, { useState } from 'react';
import { Menu, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Chat } from '@/types';
import { format } from 'date-fns';

interface MobileNavProps {
  chats: Chat[];
  onNewChat: () => Promise<any>;
  onSelectChat: (chatId: number) => Promise<any>;
  currentChatId?: number;
}

export default function MobileNav({ chats, onNewChat, onSelectChat, currentChatId }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  
  const handleSelectChat = async (chatId: number) => {
    await onSelectChat(chatId);
    setOpen(false);
  };
  
  const handleNewChat = async () => {
    await onNewChat();
    setOpen(false);
  };
  
  return (
    <div className="sticky top-0 z-20 flex md:hidden items-center justify-between p-3 border-b border-gray-700 bg-dark-900 backdrop-blur-md bg-opacity-90">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-transparent px-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-full max-w-xs sm:max-w-md bg-dark-800 border-r border-gray-700">
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="p-4 flex items-center border-b border-gray-700">
              <div className="flex items-center">
                <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center mr-3">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="font-bold text-lg">ChatMarko</div>
              </div>
            </div>
            
            {/* New Chat Button */}
            <div className="p-4">
              <Button 
                onClick={handleNewChat}
                className="w-full bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Chat Baru</span>
              </Button>
            </div>
            
            {/* Chat List */}
            <div className="flex-grow overflow-y-auto">
              {chats.length > 0 && (
                <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">
                  Chat Terbaru
                </div>
              )}
              
              {chats.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`px-3 py-3 hover:bg-dark-700 rounded-lg mx-2 cursor-pointer transition-colors duration-150 mb-1 ${
                    currentChatId === chat.id ? 'bg-dark-700 border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="text-sm text-gray-300 truncate">{chat.title}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(chat.createdAt), 'd MMMM, yyyy')}
                  </div>
                </div>
              ))}
              
              {chats.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-4 px-4">
                  Belum ada chat. Mulai chat baru!
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center">
        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center mr-2">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="font-bold">ChatMarko</div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-400 hover:text-white hover:bg-transparent"
        onClick={onNewChat}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
