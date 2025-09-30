'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Camera, X, Check, Save, Upload, Edit, Instagram, Trash2, ArrowLeft } from 'lucide-react';
import { FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

export default function CompleteProfileOnboardingPage() {
  const router = useRouter();

  // Initial state for comparison
  const initialState = {
    bio: '',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Onboarding&backgroundColor=b6e3f4',
    bannerImage: null as string | null,
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
    }
  };

  // State for profile data (no display name here)
  const [profileData, setProfileData] = useState({
    bio: '',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Onboarding&backgroundColor=b6e3f4',
    bannerImage: null as string | null,
  });

  // State for social links
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    linkedin: '',
  });

  // File states for tracking actual file uploads
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  // Social validation state
  const [socialValidation, setSocialValidation] = useState({
    instagram: { isValid: true, message: '' },
    twitter: { isValid: true, message: '' },
    linkedin: { isValid: true, message: '' },
  });

  // Modal states for editing social links
  const [modalStates, setModalStates] = useState({
    instagram: false,
    x: false,
    linkedin: false,
  });

  // Temporary input state for modal editing
  const [tempSocialInput, setTempSocialInput] = useState('');

  // State for form errors (bio only here)
  const [errors, setErrors] = useState<{ bio: string }>({ bio: '' });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBannerMenu, setShowBannerMenu] = useState(false);
  const [bannerAnim, setBannerAnim] = useState(false);
  const [profileAnim, setProfileAnim] = useState(false);

  // File input refs
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Check if form has changes
  const hasChanges = () => {
    return (
      profileData.bio !== initialState.bio ||
      profileImageFile !== null ||
      bannerImageFile !== null ||
      socialLinks.instagram !== initialState.socialLinks.instagram ||
      socialLinks.twitter !== initialState.socialLinks.twitter ||
      socialLinks.linkedin !== initialState.socialLinks.linkedin
    );
  };

  // Regex validation functions for social links (reused)
  const validateInstagram = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) return { isValid: true, message: '' };
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    if (!instagramRegex.test(url)) {
      return { isValid: false, message: 'Please enter a valid Instagram URL (e.g., instagram.com/username)' };
    }
    return { isValid: true, message: '' };
  };

  const validateTwitter = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) return { isValid: true, message: '' };
    const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/;
    if (!twitterRegex.test(url)) {
      return { isValid: false, message: 'Please enter a valid Twitter/X URL (e.g., x.com/username or twitter.com/username)' };
    }
    return { isValid: true, message: '' };
  };

  const validateLinkedIn = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) return { isValid: true, message: '' };
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/;
    if (!linkedinRegex.test(url)) {
      return { isValid: false, message: 'Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)' };
    }
    return { isValid: true, message: '' };
  };

  const handleSocialLinkChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));

    const validation = (() => {
      switch (platform) {
        case 'instagram':
          return validateInstagram(value);
        case 'twitter':
          return validateTwitter(value);
        case 'linkedin':
          return validateLinkedIn(value);
        default:
          return { isValid: true, message: '' };
      }
    })();

    setSocialValidation(prev => ({ ...prev, [platform]: validation }));
  };

  // Ensure only one menu is open at a time
  useEffect(() => { if (showBannerMenu) setShowProfileMenu(false); }, [showBannerMenu]);
  useEffect(() => { if (showProfileMenu) setShowBannerMenu(false); }, [showProfileMenu]);

  // Lock body scroll when any popup is open
  useEffect(() => {
    const lock = showBannerMenu || showProfileMenu;
    const prev = document.body.style.overflow;
    if (lock) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [showBannerMenu, showProfileMenu]);

  // Animate popups on open
  useEffect(() => { if (showBannerMenu) requestAnimationFrame(() => setBannerAnim(true)); else setBannerAnim(false); }, [showBannerMenu]);
  useEffect(() => { if (showProfileMenu) requestAnimationFrame(() => setProfileAnim(true)); else setProfileAnim(false); }, [showProfileMenu]);

  // Banner image handlers
  const handleBannerImageSelect = () => { bannerFileInputRef.current?.click(); setShowBannerMenu(false); };
  const handleRemoveBannerImage = () => { 
    setProfileData(prev => ({ ...prev, bannerImage: null })); 
    setBannerImageFile(null);
    setShowBannerMenu(false); 
  };

  // Profile image handlers
  const handleProfileImageSelect = () => { profileFileInputRef.current?.click(); setShowProfileMenu(false); };
  const handleRemoveProfileImage = () => { 
    setProfileData(prev => ({ ...prev, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Onboarding&backgroundColor=b6e3f4' })); 
    setProfileImageFile(null);
    setShowProfileMenu(false); 
  };

  // Generic input change
  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (field === 'bio' && errors.bio) setErrors(prev => ({ ...prev, bio: '' }));
  };

  const validateForm = () => {
    const newErrors = { bio: '' } as { bio: string };
    let isValid = true;
    
    // Validate bio length
    if (profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
      isValid = false;
    }
    
    // Check social link validations
    const socialValidationErrors = Object.values(socialValidation).some(validation => !validation.isValid);
    if (socialValidationErrors) {
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure user is authenticated and Supabase is reachable
    let accessToken: string | null = null;

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('Failed to fetch Supabase session:', error instanceof Error ? error.message : error);
        alert('We could not verify your session. Please sign in again.');
        router.push('/auth/signin');
        return;
      }

      accessToken = data.session?.access_token ?? null;
    } catch (sessionError) {
      console.warn('Network error while fetching Supabase session:', sessionError instanceof Error ? sessionError.message : sessionError);
      alert('We could not reach Supabase. Check your connection and try again.');
      return;
    }

    if (!accessToken) {
      alert('Please sign in to update your profile.');
      router.push('/auth/signin');
      return;
    }

    if (!validateForm()) {
      alert('Please fix the validation errors before saving.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add text data
      formData.append('bio', profileData.bio);
      formData.append('instagram', socialLinks.instagram);
      formData.append('twitter', socialLinks.twitter);
      formData.append('linkedin', socialLinks.linkedin);

      // Add image files if they exist
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      if (bannerImageFile) {
        formData.append('bannerImage', bannerImageFile);
      }

      const response = await fetch('/api/profile/social', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Please sign in to continue.');
          router.push('/auth/signin');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/radar');
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/radar');
  };

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="mb-4 w-full">
            <button
              onClick={() => router.push('/onboarding/profile/basic')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
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
              Complete your profile
            </h1>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="bg-green-600 text-white p-4 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span style={{ fontFamily: 'var(--font-inter)' }}>Profile updated successfully!</span>
            </div>
          </div>
        )}

        {/* Profile Layout */}
        <div className="w-full">
          <div className="relative">
            {/* Banner Background */}
            <div className="relative">
              <div
                className="h-48 sm:h-64 cursor-pointer group"
                style={{
                  backgroundImage: profileData.bannerImage
                    ? `url(${profileData.bannerImage})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                onClick={() => setShowBannerMenu(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/30 absolute inset-0 transition-colors duration-200" />
                  <div className="opacity-100 transition-opacity duration-200 relative z-10">
                    <div className="bg-black/75 rounded-full p-3">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Menu Popup */}
              {showBannerMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowBannerMenu(false)} />
                  <div
                    role="dialog"
                    aria-modal="true"
                    className={`relative z-10 bg-black rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl ring-1 ring-white/20 transform transition-all duration-200 ${bannerAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-3">
                      <button
                        onClick={handleBannerImageSelect}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-black border border-white rounded-lg text-white transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span style={{ fontFamily: 'var(--font-inter)' }}>Upload Banner</span>
                      </button>
                      <button
                        onClick={handleRemoveBannerImage}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-black border border-white rounded-lg text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span style={{ fontFamily: 'var(--font-inter)' }}>Remove Banner</span>
                      </button>
                      <button
                        onClick={() => setShowBannerMenu(false)}
                        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white transition-colors"
                        style={{ fontFamily: 'var(--font-inter)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="relative bg-black px-4 sm:px-6 pb-6">
              <div className="flex justify-between items-start pt-4">
                <div className="flex flex-col">
                  {/* Profile Photo */}
                  <div className="relative -mt-12 sm:-mt-16 mb-4">
                    <div className="relative cursor-pointer group" onClick={() => setShowProfileMenu(true)}>
                      <Image
                        src={profileData.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                        priority
                        unoptimized
                      />
                      <div className="absolute inset-0 z-30 pointer-events-none transition-all duration-200 flex items-center justify-center rounded-lg">
                        <div className="opacity-100 transition-opacity duration-200 relative z-30">
                          <div className="bg-black/75 rounded-full p-3">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="bg-black/50 absolute inset-0 rounded-lg transition-colors duration-200" />
                      </div>
                    </div>

                    {/* Profile Menu Popup */}
                    {showProfileMenu && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowProfileMenu(false)} />
                        <div
                          role="dialog"
                          aria-modal="true"
                          className={`relative z-10 bg-black rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl ring-1 ring-white/20 transform transition-all duration-200 ${profileAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-3">
                            <button
                              onClick={handleProfileImageSelect}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-black border border-white rounded-lg text-white transition-colors"
                            >
                              <Upload className="w-5 h-5" />
                              <span style={{ fontFamily: 'var(--font-inter)' }}>Upload Profile Picture</span>
                            </button>
                            <button
                              onClick={handleRemoveProfileImage}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-black border border-white rounded-lg text-white transition-colors"
                            >
                              <X className="w-5 h-5" />
                              <span style={{ fontFamily: 'var(--font-inter)' }}>Remove Profile Picture</span>
                            </button>
                            <button
                              onClick={() => setShowProfileMenu(false)}
                              className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white transition-colors"
                              style={{ fontFamily: 'var(--font-inter)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 space-y-3 pb-8 mt-1.5">
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-white font-medium mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-black border ${errors.bio ? 'border-red-500' : 'border-white'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors resize-none`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                      {errors.bio}
                    </p>
                  )}
                  <p className={`text-sm ml-auto ${profileData.bio.length > 450 ? 'text-red-400' : 'text-gray-400'}`} style={{ fontFamily: 'var(--font-inter)' }}>
                    {profileData.bio.length}/500
                  </p>
                </div>
              </div>

            {/* Social Links Section */}
            <div>
              <label className="block text-white font-medium mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                Social Links
              </label>
              <div className="space-y-4">
                {/* Instagram Card */}
                <div className="bg-black border border-white rounded-lg p-4 shadow-lg transform transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-purple-400" 
                     style={{ boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)', background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 flex items-center justify-center flex-shrink-0">
                        <Instagram className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          Instagram
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {socialLinks.instagram || 'No link added'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setIsSubmitting(false); setTempSocialInput(socialLinks.instagram); setModalStates(prev => ({ ...prev, instagram: true })); }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* X (Twitter) Card */}
                <div className="bg-black border border-white rounded-lg p-4 shadow-lg transform transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-gray-400" 
                     style={{ boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)', background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-black border-2 border-gray-600 flex items-center justify-center flex-shrink-0">
                        <FaXTwitter className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          X
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {socialLinks.twitter || 'No link added'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setIsSubmitting(false); setTempSocialInput(socialLinks.twitter); setModalStates(prev => ({ ...prev, x: true })); }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* LinkedIn Card */}
                <div className="bg-black border border-white rounded-lg p-4 shadow-lg transform transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-blue-400" 
                     style={{ boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)', background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <FaLinkedin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          LinkedIn
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {socialLinks.linkedin || 'No link added'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setIsSubmitting(false); setTempSocialInput(socialLinks.linkedin); setModalStates(prev => ({ ...prev, linkedin: true })); }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={!hasChanges() || isSubmitting}
                className={`flex-1 px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  hasChanges() && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hidden File Inputs */}
          <input
            ref={profileFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file size (10MB limit)
                if (file.size > 10 * 1024 * 1024) {
                  alert('Image size must be less than 10MB');
                  return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!allowedTypes.includes(file.type)) {
                  alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
                  return;
                }
                
                setProfileImageFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                  setProfileData(prev => ({ ...prev, profileImage: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          <input
            ref={bannerFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file size (10MB limit)
                if (file.size > 10 * 1024 * 1024) {
                  alert('Image size must be less than 10MB');
                  return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!allowedTypes.includes(file.type)) {
                  alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
                  return;
                }
                
                setBannerImageFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                  setProfileData(prev => ({ ...prev, bannerImage: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />

          {/* Social Link Edit Modals */}
          {/* Instagram Modal */}
          {modalStates.instagram && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setModalStates(prev => ({ ...prev, instagram: false }))} />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 bg-black rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl ring-1 ring-white/20 transform transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 flex items-center justify-center">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        Instagram
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove Instagram"
                      onClick={() => { handleSocialLinkChange('instagram', ''); setModalStates(prev => ({ ...prev, instagram: false })); setTempSocialInput(''); }}
                      className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={tempSocialInput}
                      onChange={(e) => setTempSocialInput(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
                      style={{ fontFamily: 'var(--font-inter)' }}
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { handleSocialLinkChange('instagram', tempSocialInput); setModalStates(prev => ({ ...prev, instagram: false })); setTempSocialInput(''); }}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalStates(prev => ({ ...prev, instagram: false })); setTempSocialInput(''); }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* X (Twitter) Modal */}
          {modalStates.x && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setModalStates(prev => ({ ...prev, x: false }))} />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 bg-black rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl ring-1 ring-white/20 transform transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black border-2 border-gray-600 flex items-center justify-center">
                        <FaXTwitter className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        X
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove X"
                      onClick={() => { handleSocialLinkChange('twitter', ''); setModalStates(prev => ({ ...prev, x: false })); setTempSocialInput(''); }}
                      className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={tempSocialInput}
                      onChange={(e) => setTempSocialInput(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                      style={{ fontFamily: 'var(--font-inter)' }}
                      placeholder="https://x.com/yourusername"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { handleSocialLinkChange('twitter', tempSocialInput); setModalStates(prev => ({ ...prev, x: false })); setTempSocialInput(''); }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalStates(prev => ({ ...prev, x: false })); setTempSocialInput(''); }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Modal */}
          {modalStates.linkedin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setModalStates(prev => ({ ...prev, linkedin: false }))} />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 bg-black rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl ring-1 ring-white/20 transform transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <FaLinkedin className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        LinkedIn
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove LinkedIn"
                      onClick={() => { handleSocialLinkChange('linkedin', ''); setModalStates(prev => ({ ...prev, linkedin: false })); setTempSocialInput(''); }}
                      className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={tempSocialInput}
                      onChange={(e) => setTempSocialInput(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      style={{ fontFamily: 'var(--font-inter)' }}
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { handleSocialLinkChange('linkedin', tempSocialInput); setModalStates(prev => ({ ...prev, linkedin: false })); setTempSocialInput(''); }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalStates(prev => ({ ...prev, linkedin: false })); setTempSocialInput(''); }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

