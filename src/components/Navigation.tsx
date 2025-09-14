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
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl">
      <div className="flex justify-around items-center py-1 px-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center justify-center p-3 transition-all duration-200"
            >
              {item.path === '/radar' && (
                <Users 
                  size={24}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-blue-500' : 'text-white'
                  }`}
                />
              )}
              {item.path === '/feed' && (
                <Compass 
                  size={24}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-blue-500' : 'text-white'
                  }`}
                />
              )}
              {item.path === '/create' && (
                <Plus 
                  size={24}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-blue-500' : 'text-white'
                  }`}
                />
              )}
              {item.path === '/messages' && (
                <MessageSquare 
                  size={24}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-blue-500' : 'text-white'
                  }`}
                />
              )}
              {item.path === '/profile' && (
                <UserCircle 
                  size={24}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-blue-500' : 'text-white'
                  }`}
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