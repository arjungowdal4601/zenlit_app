'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">Completing authentication...</p>
      <p className="text-gray-400 text-sm mt-2">Please wait while we sign you in</p>
    </div>
  </div>
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/signin?error=auth_failed');
          return;
        }

        if (data.session) {
          // Check if this is a new user (first time signing up with Google)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (!profile) {
            // New user - redirect to profile creation
            router.push('/onboarding/profile/basic');
          } else {
            // Existing user - redirect to main app
            router.push('/radar');
          }
        } else {
          // No session found
          router.push('/auth/signin?error=no_session');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth/signin?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return <LoadingState />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

