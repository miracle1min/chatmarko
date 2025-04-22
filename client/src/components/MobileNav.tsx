import React, { useState } from 'react';
import { Menu, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import { Chat } from '@/types';

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
    <div className="flex md:hidden items-center justify-between p-4 border-b border-gray-700">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80 sm:max-w-lg bg-dark-800 border-r border-gray-700">
          <Sidebar 
            chats={chats} 
            onNewChat={handleNewChat} 
            onSelectChat={handleSelectChat}
            currentChatId={currentChatId}
          />
        </SheetContent>
      </Sheet>
      
      <div className="font-bold">ChatMarko</div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-gray-400 hover:text-white"
        onClick={onNewChat}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
