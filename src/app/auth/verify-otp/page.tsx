'use client';

import AppLayout from '@/components/AppLayout';
import { mergeClassNames } from '@/utils/classNames';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const CODE_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isComplete = code.length === CODE_LENGTH;
  // Removed progress calculation; we only show simple countdown text now

  const startCooldown = useCallback((seconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (seconds <= 0) {
      setCooldown(0);
      return;
    }

    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const emailParam = searchParams.get('email');
  const sentParam = searchParams.get('sent');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      // Removed initial status copy per design: no "We sent a 6-digit code to ..."
    }
  }, [emailParam]);

  useEffect(() => {
    if (sentParam === '1') {
      startCooldown(COOLDOWN_SECONDS);
    }
  }, [sentParam, startCooldown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(sanitized);
    if (error) {
      setError(null);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setError('We could not detect your email. Please return to sign up and try again.');
      return;
    }

    if (!isComplete) {
      setError('Enter the full 6-digit code to continue.');
      return;
    }

    try {
      setVerifying(true);
      setError(null);
      setStatus(null);

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Invalid or expired code.');
      }

      setStatus('Email verified! Taking you to your profile setup...');
      router.push('/onboarding/profile/basic');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('We could not detect your email. Please return to sign up and try again.');
      return;
    }

    try {
      setResending(true);
      setError(null);
      setStatus('Sending a fresh code to your inbox...');
      setCode('');

      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to resend the code. Please try again.');
      }

      startCooldown(COOLDOWN_SECONDS);
      setStatus('A new code is on the way. Check your inbox in a moment.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to resend the code right now.';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] flex flex-col bg-black px-4 text-white selection:bg-blue-500/60 selection:text-white">
        <div className="pt-6 pb-4">
          <button
            onClick={() => router.push('/auth/signup')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 pb-14">
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h1
                className="text-4xl font-semibold tracking-tight"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 55%, #7e22ce 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Zenlit
              </h1>
              <p className="mt-1 text-base text-slate-300">Connect with people around you</p>
            </div>

            <div
              className="w-full rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-900/90 via-slate-950/85 to-slate-950/95 p-8 shadow-[0_28px_70px_-30px_rgba(15,23,42,0.9)] backdrop-blur"
            >
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-2 text-sm text-slate-300">
                <MailCheck className="h-5 w-5 text-blue-400" />
                <span>
                  Check your inbox at{' '}
                  <span className="font-semibold text-white">{email || 'your email'}</span>
                </span>
              </div>

              {status && (
                <p className="mt-4 text-center text-sm text-blue-300">{status}</p>
              )}

              {error && (
                <p className="mt-4 text-center text-sm text-rose-300">{error}</p>
              )}

              <form onSubmit={handleVerify} className="mt-6 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Enter the 6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={handleCodeChange}
                    className="h-14 w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 text-center text-xl font-semibold tracking-[0.6em] text-white transition-colors focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Tip: while we&apos;re in preview, use the demo code{' '}
                    <span className="font-semibold text-slate-200">000000</span>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isComplete || verifying}
                  className={mergeClassNames(
                    'w-full rounded-xl px-5 py-3 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-60',
                    isComplete && !verifying
                      ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-600/95 hover:to-purple-700/95 shadow-[0_20px_45px_-18px_rgba(37,99,235,0.55)]'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {verifying ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>

              <div className="mt-8 text-center">
                {cooldown > 0 ? (
                  <p className="text-sm text-slate-400">Resend code available in <span className="font-semibold text-white">{cooldown}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resending ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </div>
            </div>

            {/* Removed "Wrong email? Start over" per requirement */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}