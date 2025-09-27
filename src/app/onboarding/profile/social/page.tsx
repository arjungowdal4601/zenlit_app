'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Check, Upload, X } from 'lucide-react';

import AppHeader from '@/components/AppHeader';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import type { SocialLinks } from '@/constants/socialPlatforms';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, uploadUserFile } from '@/utils/supabase';

const defaultLinks: SocialLinks = {
  instagram: '',
  linkedin: '',
  twitter: '',
};

export default function CompleteProfileOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ ...defaultLinks });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('bio, social_links, avatar_url, banner_url')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (loadError) {
        console.error('Unable to load profile', loadError);
        setError('Unable to load your profile. Please try again.');
        return;
      }

      setBio(data?.bio ?? '');
      const links = (data?.social_links as SocialLinks | null) ?? null;
      setSocialLinks({
        instagram: links?.instagram ?? '',
        linkedin: links?.linkedin ?? '',
        twitter: links?.twitter ?? '',
      });
      setAvatarUrl(data?.avatar_url ?? null);
      setBannerUrl(data?.banner_url ?? null);
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const buildLinks = () => {
    const cleaned: SocialLinks = {};
    (Object.keys(socialLinks) as (keyof SocialLinks)[]).forEach((key) => {
      const value = socialLinks[key]?.trim();
      if (value) {
        cleaned[key] = value;
      }
    });
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError('You must be signed in to continue.');
      return;
    }

    if (bio.length > 500) {
      setError('Bio must be 500 characters or fewer.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let nextAvatar = avatarUrl;
      let nextBanner = bannerUrl;

      if (avatarFile) {
        nextAvatar = await uploadUserFile('avatars', user.id, avatarFile);
      }

      if (bannerFile) {
        nextBanner = await uploadUserFile('banners', user.id, bannerFile);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim() || null,
          social_links: buildLinks(),
          avatar_url: nextAvatar,
          banner_url: nextBanner,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarFile(null);
      setBannerFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (submitError) {
      console.error('Error saving profile', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <AppHeader title="Complete your profile" />
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-10">
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-600/90 px-4 py-3 text-white">
              <Check className="h-5 w-5" />
              <span>Profile updated successfully</span>
            </div>
          )}

          {error && <div className="mb-6 rounded-lg bg-red-600/90 px-4 py-3 text-white">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-black p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Profile photos</h2>

              <div className="space-y-6">
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-2">Banner</span>
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    {bannerUrl && <Image src={bannerUrl} alt="Banner" fill className="object-cover" />}
                    <button
                      type="button"
                      onClick={() => setBannerModalOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setBannerFile(file);
                        setBannerUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-500">No avatar</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        setAvatarUrl(URL.createObjectURL(file));
                      }
                    }}
                  />

                  <p className="text-sm text-gray-400">
                    Upload a profile photo so people can recognise you.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-white/40 bg-black px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Tell people a little about yourself"
                />
                <p className="mt-1 text-xs text-gray-500">{bio.length}/500</p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Social links</h2>
              {([
                { key: 'instagram' as const, label: 'Instagram', placeholder: 'yourhandle' },
                { key: 'linkedin' as const, label: 'LinkedIn', placeholder: 'your-profile' },
                { key: 'twitter' as const, label: 'X (Twitter)', placeholder: 'yourhandle' },
              ]).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                  <input
                    type="text"
                    value={socialLinks[key] ?? ''}
                    onChange={(event) => setSocialLinks((prev) => ({ ...prev, [key]: event.target.value }))}
                    className="w-full rounded-lg border border-white/40 bg-black px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push('/radar')}
                className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        open={avatarModalOpen}
        title="Update avatar"
        onClose={() => setAvatarModalOpen(false)}
        actions={[
          {
            label: 'Upload',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => {
              avatarInputRef.current?.click();
              setAvatarModalOpen(false);
            },
          },
          {
            label: 'Remove',
            icon: <X className="h-4 w-4" />,
            onClick: () => {
              setAvatarFile(null);
              setAvatarUrl(null);
              setAvatarModalOpen(false);
            },
          },
        ]}
      />

      <Modal
        open={bannerModalOpen}
        title="Update banner"
        onClose={() => setBannerModalOpen(false)}
        actions={[
          {
            label: 'Upload',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => {
              bannerInputRef.current?.click();
              setBannerModalOpen(false);
            },
          },
          {
            label: 'Remove',
            icon: <X className="h-4 w-4" />,
            onClick: () => {
              setBannerFile(null);
              setBannerUrl(null);
              setBannerModalOpen(false);
            },
          },
        ]}
      />
    </AppLayout>
  );
}
