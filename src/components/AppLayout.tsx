"use client";

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname() ?? '';
  // Show navigation on the messages list (/messages), hide it on chat detail (/messages/[chatId])
  const showNav = !pathname.startsWith('/messages/');

  return (
    <div className="min-h-screen bg-black text-white">
      <main className={showNav ? "pb-20" : "pb-0"}>
        {children}
      </main>
      {showNav && <Navigation />}
    </div>
  );
};

export default AppLayout;