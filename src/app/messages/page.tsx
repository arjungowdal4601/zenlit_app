'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const MessagesScreen = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  
  const mockChats = [
    {
      id: 1,
      user: 'Alex Chen',
      lastMessage: 'Hey! Are you still up for coffee later?',
      time: '2 min ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      user: 'Sarah Kim',
      lastMessage: 'Thanks for the recommendation!',
      time: '1 hour ago',
      unread: 0,
      online: true
    },
    {
      id: 3,
      user: 'Mike Johnson',
      lastMessage: 'Let\'s meet at the tennis court at 3pm',
      time: '3 hours ago',
      unread: 1,
      online: false
    },
    {
      id: 4,
      user: 'Emma Wilson',
      lastMessage: 'Great meeting you today!',
      time: '1 day ago',
      unread: 0,
      online: false
    }
  ];

  return (
    <AppLayout>
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 
            className="text-3xl md:text-4xl mb-2 tracking-tight font-medium"
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'var(--font-inter)'
            }}
          >
            💬 Messages
          </h1>
          <p 
            className="text-gray-400 text-sm"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Connect with people nearby
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-slate-800 text-white rounded-lg pl-10 pr-4 py-3 border border-slate-700 focus:border-blue-500 focus:outline-none"
                style={{ fontFamily: 'var(--font-inter)' }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
          
          {/* Chat List */}
          <div className="space-y-2">
            {mockChats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {chat.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                        {chat.user}
                      </h3>
                      <span className="text-gray-400 text-xs">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State or New Chat Button */}
          <div className="mt-6">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="mr-2">➕</span>
              Start New Conversation
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-300 py-3 px-4 rounded-lg transition-colors border border-slate-700">
              <div className="text-center">
                <div className="text-xl mb-1">👥</div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-inter)' }}>Groups</span>
              </div>
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-300 py-3 px-4 rounded-lg transition-colors border border-slate-700">
              <div className="text-center">
                <div className="text-xl mb-1">📞</div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-inter)' }}>Calls</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MessagesScreen;