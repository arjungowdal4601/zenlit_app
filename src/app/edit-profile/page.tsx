'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Camera, Check, Upload, X } from 'lucide-react';

import AppHeader from '@/components/AppHeader';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/utils/supabase';
import { supabase, uploadUserFile } from '@/utils/supabase';
import type { SocialLinks } from '@/constants/socialPlatforms';

interface FormState {
  fullName: string;
  bio: string;
  socialLinks: SocialLinks;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

const emptyLinks: SocialLinks = {
  instagram: '',
  linkedin: '',
  twitter: '',
};

const mapProfileToState = (profile: Tables['profiles'] | null): FormState => ({
  fullName: profile?.full_name ?? '',
  bio: profile?.bio ?? '',
  socialLinks: {
    instagram: (profile?.social_links as SocialLinks | null)?.instagram ?? '',
    linkedin: (profile?.social_links as SocialLinks | null)?.linkedin ?? '',
    twitter: (profile?.social_links as SocialLinks | null)?.twitter ?? '',
  },
  avatarUrl: profile?.avatar_url ?? null,
  bannerUrl: profile?.banner_url ?? null,
});

const EditProfilePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<FormState>(() => ({
    fullName: '',
    bio: '',
    socialLinks: { ...emptyLinks },
    avatarUrl: null,
    bannerUrl: null,
  }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; bio?: string }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, bio, social_links, avatar_url, banner_url')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to load profile', error);
        setFormError('Unable to load your profile. Please try again.');
      }

      setFormState(mapProfileToState(data ?? null));
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const handleBack = () => {
    router.push('/profile');
  };

  const handleInputChange = (field: 'fullName' | 'bio', value: string) => {
    setFormError(null);
    if (field === 'fullName') {
      setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
      setFormState((prev) => ({ ...prev, fullName: value }));
    } else {
      setFieldErrors((prev) => ({ ...prev, bio: undefined }));
      setFormState((prev) => ({ ...prev, bio: value }));
    }
  };

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    setFormState((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const validate = () => {
    const errors: { fullName?: string; bio?: string } = {};

    if (!formState.fullName.trim()) {
      errors.fullName = 'Display name is required';
    }

    if (formState.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or fewer';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildSocialLinks = (): SocialLinks | null => {
    const cleaned: SocialLinks = {};
    (Object.keys(formState.socialLinks) as (keyof SocialLinks)[]).forEach((key) => {
      const value = formState.socialLinks[key]?.trim();
      if (value) {
        cleaned[key] = value;
      }
    });
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setFormError('You must be signed in to update your profile.');
      return;
    }

    if (!validate()) {
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      let nextAvatarUrl = formState.avatarUrl;
      let nextBannerUrl = formState.bannerUrl;

      if (avatarFile) {
        nextAvatarUrl = await uploadUserFile('avatars', user.id, avatarFile);
      }

      if (bannerFile) {
        nextBannerUrl = await uploadUserFile('banners', user.id, bannerFile);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formState.fullName.trim(),
          bio: formState.bio.trim() || null,
          social_links: buildSocialLinks(),
          avatar_url: nextAvatarUrl,
          banner_url: nextBannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setAvatarFile(null);
      setBannerFile(null);
      setFormState((prev) => ({
        ...prev,
        avatarUrl: nextAvatarUrl ?? null,
        bannerUrl: nextBannerUrl ?? null,
      }));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error('Error updating profile', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const socialLinkEntries = useMemo(
    () => (
      [
        { label: 'Instagram', key: 'instagram' as const, placeholder: 'yourhandle' },
        { label: 'LinkedIn', key: 'linkedin' as const, placeholder: 'your-profile' },
        { label: 'X (Twitter)', key: 'twitter' as const, placeholder: 'yourhandle' },
      ]
    ),
    []
  );

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <AppHeader
            title="Edit Profile"
            left={(
              <button
                type="button"
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-10">
          {showSuccess && (
            <div className="mb-6 rounded-lg bg-green-600/90 px-4 py-3 text-white flex items-center gap-3">
              <Check className="h-5 w-5" />
              <span>Profile updated successfully</span>
            </div>
          )}

          {formError && (
            <div className="mb-6 rounded-lg bg-red-600/90 px-4 py-3 text-white">{formError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-black p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Profile photos</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Banner</label>
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    {formState.bannerUrl && (
                      <Image src={formState.bannerUrl} alt="Banner" fill className="object-cover" />
                    )}
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
                        setFormState((prev) => ({ ...prev, bannerUrl: URL.createObjectURL(file) }));
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    {formState.avatarUrl ? (
                      <Image src={formState.avatarUrl} alt="Avatar" fill className="object-cover" />
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
                        setFormState((prev) => ({ ...prev, avatarUrl: URL.createObjectURL(file) }));
                      }
                    }}
                  />

                  <p className="text-sm text-gray-400">
                    Upload a square image at least 400x400 pixels. PNG or JPG recommended.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display name</label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(event) => handleInputChange('fullName', event.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 bg-black text-white focus:outline-none focus:ring-2 focus:ring-white ${
                    fieldErrors.fullName ? 'border-red-500' : 'border-white'
                  }`}
                  placeholder="Your name"
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={formState.bio}
                  onChange={(event) => handleInputChange('bio', event.target.value)}
                  rows={4}
                  className={`w-full rounded-lg border px-3 py-2 bg-black text-white focus:outline-none focus:ring-2 focus:ring-white ${
                    fieldErrors.bio ? 'border-red-500' : 'border-white/40'
                  }`}
                  placeholder="Tell people about yourself"
                />
                <p className="mt-1 text-xs text-gray-500">{formState.bio.length}/500</p>
                {fieldErrors.bio && <p className="mt-1 text-sm text-red-400">{fieldErrors.bio}</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Social links</h2>
              {socialLinkEntries.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                  <input
                    type="text"
                    value={formState.socialLinks[key] ?? ''}
                    onChange={(event) => handleSocialChange(key, event.target.value)}
                    className="w-full rounded-lg border border-white/40 bg-black px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </section>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                onClick={() => router.push('/profile')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
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
              setFormState((prev) => ({ ...prev, avatarUrl: null }));
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
              setFormState((prev) => ({ ...prev, bannerUrl: null }));
              setBannerModalOpen(false);
            },
          },
        ]}
      />
    </AppLayout>
  );
};

export default EditProfilePage;
