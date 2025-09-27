'use client';

import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { mergeClassNames } from '@/utils/classNames';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const continueWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error);
        alert('Failed to sign in with Google. Please try again.');
        return;
      }

      // The redirect will be handled by the OAuth callback
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const continueWithEmail = async () => {
    try {
      setLoading(true);
      const { data, error } = await signInWithOtp(email.trim());
      
      if (error) {
        console.error('OTP request error:', error);
        alert(error.message || 'Failed to send verification code. Please try again.');
        return;
      }

      router.push(`/auth/verify-otp-signin?email=${encodeURIComponent(email.trim())}&sent=1`);
    } catch (error) {
      console.error('Unexpected error during OTP request:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-black px-4">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-medium tracking-tight"
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'var(--font-inter)'
            }}
          >
            Zenlit
          </h1>
          <p className="text-gray-300 text-lg mt-1">Connect with people around you</p>
        </div>

        {/* 3D Sign-in Box (mirrors Sign Up) */}
        <div className="w-full max-w-sm bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform-gpu backdrop-blur-sm"
             style={{
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
               transform: 'perspective(1000px) rotateX(2deg)',
             }}>
          <h2 className="text-center text-2xl font-semibold text-white mb-6">Sign In</h2>

          <button
            onClick={continueWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium border border-gray-200 rounded-xl px-4 py-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <FcGoogle className="text-2xl" />
            <span className="text-gray-900 font-medium">Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            <span className="text-gray-400 text-xs px-2">or sign in with email</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600 to-transparent"></div>
          </div>

          <label className="block text-sm text-gray-300 mb-2 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
          />
          <button
            onClick={continueWithEmail}
            disabled={!isValidEmail || loading}
            className={mergeClassNames(
              'mt-4 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
              isValidEmail
                ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800'
                : 'bg-slate-700/60 text-slate-300'
            )}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/auth/signup')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign Up
            </button>
          </p>
        </div>

        {/* Terms and Privacy - Outside the box */}
        <p className="text-center text-gray-500 text-xs mt-8 max-w-sm">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </AppLayout>
  );
}
