import React from 'react';
import { Plus, Settings, User, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat } from '@/types';
import { format } from 'date-fns';
import ApiDocsLink from './ApiDocsLink';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  chats: Chat[];
  onNewChat: () => Promise<any>;
  onSelectChat: (chatId: number) => Promise<any>;
  onDeleteChat?: (chatId: number) => Promise<any>;
  currentChatId?: number;
}

export default function Sidebar({ chats, onNewChat, onSelectChat, onDeleteChat, currentChatId }: SidebarProps) {
  return (
    <div className="hidden md:flex md:w-64 lg:w-80 bg-dark-800 flex-col border-r border-gray-700/50">
      <div className="p-4 flex items-center justify-between border-b border-gray-700/30 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg">ChatMarko</span>
        </div>
        <div className="flex items-center space-x-1">
          <ApiDocsLink />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 flex justify-center">
        <Button
          onClick={onNewChat}
          className="bg-primary hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-md flex items-center justify-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Chat Baru</span>
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-grow overflow-y-auto">
        {chats.length > 0 && (
          <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">
            Chat Terbaru
          </div>
        )}

        {chats.map(chat => (
          <div
            key={chat.id}
            className={`px-3 py-2 hover:bg-dark-700 rounded-lg mx-2 cursor-pointer transition-colors duration-150 mb-1 ${
              currentChatId === chat.id ? 'bg-dark-700' : ''
            } relative group`}
          >
            <div 
              className="w-full"
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="text-sm text-gray-300 truncate pr-6">{chat.title}</div>
              <div className="text-xs text-gray-500">
                {format(new Date(chat.createdAt), 'd MMMM, yyyy')}
              </div>
            </div>
            
            {onDeleteChat && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Apakah Anda yakin ingin menghapus chat ini?')) {
                    onDeleteChat(chat.id);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-4 px-4">
            Belum ada chat. Mulai chat baru!
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-700 flex items-center">
        <div className="bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center mr-2">
          <User className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <div className="font-medium">Pengguna</div>
          <div className="text-xs text-gray-400">Free Plan</div>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto text-gray-400 hover:text-white">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
