'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GetStarted from '../components/GetStarted';

export default function Page() {
  const router = useRouter();
  
  // For now, show the GetStarted screen
  // Later this can be updated to check authentication status
  // and redirect to /radar if user is logged in
  
  return (
    <div>
      <GetStarted />
    </div>
  );
}
