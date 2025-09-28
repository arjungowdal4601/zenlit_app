'use client';

import AppLayout from '@/components/AppLayout';
import { mergeClassNames } from '@/utils/classNames';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'others', label: 'Others' },
] as const;

type GenderValue = (typeof genderOptions)[number]['value'];

export default function BasicProfileSetup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderValue | ''>('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const canContinue = Boolean(displayName.trim() && username.trim() && dob && gender);
  const hasAnyInput = Boolean(displayName.trim() || username.trim() || dob || gender);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();
    setUsername(nextValue);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    router.push('/onboarding/profile/social');
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] bg-black px-4 pb-16 pt-10 text-white selection:bg-blue-500/60 selection:text-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          {/* Back Button */}
          <div className="mb-4 w-full">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="mb-6 text-center">
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
              Tell us about yourself
            </h1>
            <p className="mt-3 max-w-2xl text-center text-base text-slate-300">
              Complete your basic profile to get started
            </p>
          </div>

          <div className="w-full rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-900/85 via-slate-950/80 to-slate-950/95 p-8 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.9)] backdrop-blur">
            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Display name</label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  placeholder="Zenlit Explorer"
                  required
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-base text-white transition-colors focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Username</label>
                <input
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="nickname"
                  placeholder="zenlit.name"
                  required
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-base text-white transition-colors focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  max={today}
                  autoComplete="bday"
                  required
                  className="date-input-white-icon w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-base text-white transition-colors focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Gender</label>
                <div className="mt-4 flex flex-nowrap gap-3" role="group" aria-label="Gender selection">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={mergeClassNames(
                        'flex-1 min-w-0 rounded-2xl border px-4 py-2.5 text-center text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                        gender === option.value
                          ? 'border-blue-500/70 bg-blue-500/10 text-white shadow-[0_18px_40px_-28px_rgba(37,99,235,0.7)]'
                          : 'border-slate-700/70 bg-slate-900/50 text-slate-200 hover:border-slate-600 hover:bg-slate-900/70'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={mergeClassNames(
                'mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-white',
                canContinue
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800'
                  : 'bg-slate-700/60 text-slate-300'
              )}
            >
              Continue to next step
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
