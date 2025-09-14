'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Compass, Plus, MessageSquare, UserCircle } from 'lucide-react';

const Navigation = () => {
  const pathname = usePathname();

  const navigationItems = [
    { path: '/radar' },
    { path: '/feed' },
    { path: '/create' },
    { path: '/messages' },
    { path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-slate-700 rounded-t-3xl shadow-2xl">
      <div className="flex justify-around items-center py-2 px-6">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center justify-center p-3 rounded-xl transition-all duration-300 hover:bg-slate-800/30"
              style={isActive ? {
                boxShadow: 'rgba(255, 255, 255, 0.2) 4px 4px 8px, rgba(255, 255, 255, 0.1) -2px -2px 4px',
                transform: 'translateY(-2px)',
                background: 'rgba(255, 255, 255, 0.05)'
              } : {}}
            >
              {item.path === '/radar' && (
                <Users 
                  size={24}
                  className="transition-all duration-200 text-white"
                  fill="none"
                  strokeWidth={2}
                />
              )}
              {item.path === '/feed' && (
                <Compass 
                  size={24}
                  className="transition-all duration-200 text-white"
                  fill="none"
                  strokeWidth={2}
                />
              )}
              {item.path === '/create' && (
                <Plus 
                  size={24}
                  className="transition-all duration-200 text-white"
                  fill="none"
                  strokeWidth={2}
                />
              )}
              {item.path === '/messages' && (
                <MessageSquare 
                  size={24}
                  className="transition-all duration-200 text-white"
                  fill="none"
                  strokeWidth={2}
                />
              )}
              {item.path === '/profile' && (
                <UserCircle 
                  size={24}
                  className="transition-all duration-200 text-white"
                  fill="none"
                  strokeWidth={2}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;