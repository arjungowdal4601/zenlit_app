'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';
import { mergeClassNames } from '../../../utils/classNames';

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  const isValid = useMemo(() => {
    return password.length >= 6 && confirmPassword.length >= 6 && password === confirmPassword;
  }, [password, confirmPassword]);

  const submit = () => {
    if (!isValid) return;
    // Keep behavior minimal per original design context
    router.push('/onboarding/profile/basic');
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] flex flex-col bg-black px-4">
        <div className="pt-6 pb-4">
          <button
            onClick={() => router.push('/auth/verify-otp' + (email ? `?email=${encodeURIComponent(email)}` : ''))}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-medium tracking-tight"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #1d4ed8 0%, #2563eb 20%, #4f46e5 55%, #7e22ce 100%)',
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

          <div
            className="w-full max-w-sm bg-slate-900/90 border border-slate-700/50 rounded-[14px] p-6 shadow-2xl backdrop-blur-sm"
            style={{
              boxShadow:
                '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <h2 className="text-center text-2xl font-semibold text-white mb-6">Set Your Password</h2>

            {/* success notice */}
            <div className="flex items-center gap-2 bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 rounded-lg px-4 py-3 mb-4">
              <CheckCircle2 className="w-5 h-5" />
              <span>Email verified successfully!</span>
            </div>

            {/* info callout */}
            <div className="flex items-start gap-2 bg-blue-600/10 text-blue-300 border border-blue-600/30 rounded-lg px-4 py-3 mb-5">
              <Info className="w-5 h-5 mt-0.5" />
              <p className="text-sm">
                <span className="font-medium">Important:</span> This password will be used for all future logins to your
                account.
              </p>
            </div>

            <label className="block text-sm text-gray-300 mb-2 font-medium">Create Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-slate-800/50 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base"
                placeholder="Create a secure password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-1">Password must be at least 6 characters</p>

            <label className="block text-sm text-gray-300 mb-2 font-medium mt-4">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-slate-800/50 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={submit}
              disabled={!isValid}
              className={mergeClassNames(
                'mt-6 w-full px-4 py-3 rounded-xl text-white font-semibold transition-all',
                isValid
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-gray-500/80 hover:bg-gray-500 cursor-not-allowed'
              )}
            >
              Set Password & Complete Signup
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}