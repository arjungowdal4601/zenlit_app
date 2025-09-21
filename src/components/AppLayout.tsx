"use client";

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname() ?? '';
  // Hide navigation during auth and onboarding flows, and on chat detail pages
  const hideNav = pathname.startsWith('/messages/') || pathname.startsWith('/auth') || pathname.startsWith('/onboarding');
  const showNav = !hideNav;

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