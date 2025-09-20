'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import { ArrowLeft, Camera, X, Check, Save, Upload, Edit, Instagram, Trash2 } from 'lucide-react';
import { FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import Image from 'next/image';

const EditProfilePage = () => {
  const router = useRouter();
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    displayName: 'Alex Johnson',
    bio: 'Software engineer passionate about AI and machine learning. Love hiking and exploring new technologies.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
    bannerImage: null as string | null,
  });

  // State for social links
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '', // Will be renamed to 'x' in UI
    linkedin: ''
  });

  // Social validation state
  const [socialValidation, setSocialValidation] = useState({
    instagram: { isValid: true, message: '' },
    twitter: { isValid: true, message: '' }, // Will be renamed to 'x' in UI
    linkedin: { isValid: true, message: '' }
  });

  // Modal states for editing social links
  const [modalStates, setModalStates] = useState({
    instagram: false,
    x: false,
    linkedin: false
  });

  // Temporary input state for modal editing
  const [tempSocialInput, setTempSocialInput] = useState('');
  const [currentEditingPlatform, setCurrentEditingPlatform] = useState<'instagram' | 'x' | 'linkedin' | null>(null);

  // State for form errors
  const [errors, setErrors] = useState<{
    displayName: string;
    bio: string;
  }>({
    displayName: '',
    bio: '',
  });

  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBannerMenu, setShowBannerMenu] = useState(false);
  // Animation flags for modals
  const [bannerAnim, setBannerAnim] = useState(false);
  const [profileAnim, setProfileAnim] = useState(false);
  
  // Overlays should be visible permanently on all devices
  const showOverlays = true;
  
  // File input refs
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.push('/profile');
  };

  // Regex validation functions for social links
  const validateInstagram = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) return { isValid: true, message: '' };
    
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    
    if (!instagramRegex.test(url)) {
      return { 
        isValid: false, 
        message: 'Please enter a valid Instagram URL (e.g., instagram.com/username)' 
      };
    }
    return { isValid: true, message: '' };
  };

  const validateTwitter = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) return { isValid: true, message: '' };
    
    const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/;
    
    if (!twitterRegex.test(url)) {
      return { 
        isValid: false, 
        message: 'Please enter a valid Twitter/X URL (e.g., x.com/username or twitter.com/username)' 
      };
    }
    return { isValid: true, message: '' };
  };

  const validateLinkedIn = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) return { isValid: true, message: '' };
    
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/;
    
    if (!linkedinRegex.test(url)) {
      return { 
        isValid: false, 
        message: 'Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)' 
      };
    }
    return { isValid: true, message: '' };
  };

  // Handle social link changes with validation
  const handleSocialLinkChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
    
    let validation;
    switch (platform) {
      case 'instagram':
        validation = validateInstagram(value);
        break;
      case 'twitter':
        validation = validateTwitter(value);
        break;
      case 'linkedin':
        validation = validateLinkedIn(value);
        break;
      default:
        validation = { isValid: true, message: '' };
    }
    
    setSocialValidation(prev => ({ ...prev, [platform]: validation }));
  };

  // Ensure only one menu is open at a time
  useEffect(() => {
    if (showBannerMenu) setShowProfileMenu(false);
  }, [showBannerMenu]);
  useEffect(() => {
    if (showProfileMenu) setShowBannerMenu(false);
  }, [showProfileMenu]);

  // Lock body scroll when any popup is open
  useEffect(() => {
    const lock = showBannerMenu || showProfileMenu;
    const prev = document.body.style.overflow;
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev || '';
    }
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [showBannerMenu, showProfileMenu]);

  // Animate popups on open
  useEffect(() => {
    if (showBannerMenu) {
      requestAnimationFrame(() => setBannerAnim(true));
    } else {
      setBannerAnim(false);
    }
  }, [showBannerMenu]);
  useEffect(() => {
    if (showProfileMenu) {
      requestAnimationFrame(() => setProfileAnim(true));
    } else {
      setProfileAnim(false);
    }
  }, [showProfileMenu]);

  // Banner image handlers
  const handleBannerImageSelect = () => {
    bannerFileInputRef.current?.click();
    setShowBannerMenu(false);
  };

  const handleRemoveBannerImage = () => {
    setProfileData(prev => ({ ...prev, bannerImage: null }));
    setShowBannerMenu(false);
  };

  // Profile image handlers
  const handleProfileImageSelect = () => {
    profileFileInputRef.current?.click();
    setShowProfileMenu(false);
  };

  const handleRemoveProfileImage = () => {
    setProfileData(prev => ({ ...prev, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4' }));
    setShowProfileMenu(false);
  };



  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field as keyof typeof errors]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {
      displayName: '',
      bio: '',
    };
    
    if (!profileData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Stay on the Edit Profile page; do not redirect
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4">
          <AppHeader
            title="Edit Profile"
            left={(
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
          />
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

        {/* Profile Layout - Similar to Profile Page */}
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
                  backgroundRepeat: 'no-repeat'
                }}
                onClick={() => setShowBannerMenu(true)}
               >
                {/* Banner Edit Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`bg-black/30 absolute inset-0 transition-colors duration-200`} />
                  <div className={`opacity-100 transition-opacity duration-200 relative z-10`}>
                    <div className="bg-black/75 rounded-full p-3">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Menu Popup */}
              {showBannerMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  {/* Translucent backdrop that blocks interactions */}
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
              {/* Profile Photo and Layout */}
              <div className="flex justify-between items-start pt-4">
                {/* Left Side: Profile Photo */}
                <div className="flex flex-col">
                  {/* Profile Photo - overlapping the banner */}
                  <div className="relative -mt-12 sm:-mt-16 mb-4">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setShowProfileMenu(true)}
                     >
                      <Image
                        src={profileData.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                        priority
                        unoptimized
                      />
                      {/* Profile Edit Overlay */}
                      <div className="absolute inset-0 z-30 pointer-events-none transition-all duration-200 flex items-center justify-center rounded-lg">
                        <div className={`opacity-100 transition-opacity duration-200 relative z-30`}>
                          <div className="bg-black/75 rounded-full p-3">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className={`bg-black/50 absolute inset-0 rounded-lg transition-colors duration-200`} />
                      </div>
                    </div>

                    {/* Profile Menu Popup */}
                    {showProfileMenu && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Translucent backdrop that blocks interactions */}
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
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 space-y-6 pb-8">
              {/* Display Name */}
              <div>
                <label 
                   htmlFor="display-name"
                   className="block text-white font-medium mb-2"
                   style={{ fontFamily: 'var(--font-inter)' }}
                 >
                   Display Name
                 </label>
                <input
                  id="display-name"
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`w-full px-4 py-3 bg-black border ${
                    errors.displayName ? 'border-red-500' : 'border-white'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                  placeholder="Enter your display name"
                />
                {errors.displayName && (
                  <p className="mt-1 text-red-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label 
                  htmlFor="bio"
                  className="block text-white font-medium mb-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-black border ${
                    errors.bio ? 'border-red-500' : 'border-white'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors resize-none`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                      {errors.bio}
                    </p>
                  )}
                  <p className={`text-sm ml-auto ${
                    profileData.bio.length > 450 ? 'text-red-400' : 'text-gray-400'
                  }`} style={{ fontFamily: 'var(--font-inter)' }}>
                    {profileData.bio.length}/500
                  </p>
                </div>
              </div>

            {/* Social Links Section */}
            <div>
              <label 
                className="block text-white font-medium mb-4"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Social Links
              </label>
              <div className="space-y-4">
                {/* Instagram Card */}
                <div className="bg-black border border-white rounded-lg p-4 shadow-lg transform transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-purple-400" 
                     style={{ 
                       boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                       background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)'
                     }}>
                  <div className="flex items-center justify-between">
                    {/* Left side: Logo and content */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Instagram Logo - Larger */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 flex items-center justify-center flex-shrink-0">
                        <Instagram className="w-7 h-7 text-white" />
                      </div>
                      
                      {/* Title and Link */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          Instagram Link
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {socialLinks.instagram || 'No link added'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side: Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubmitting(false);
                        setCurrentEditingPlatform('instagram');
                        setTempSocialInput(socialLinks.instagram);
                        setModalStates(prev => ({ ...prev, instagram: true }));
                      }}
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
                     style={{ 
                       boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                       background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)'
                     }}>
                  <div className="flex items-center justify-between">
                    {/* Left side: Logo and content */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* X Logo - Larger */}
                      <div className="w-12 h-10 rounded-lg bg-black border-2 border-gray-600 flex items-center justify-center flex-shrink-0">
                        <FaXTwitter className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title and Link */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          X Link
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {socialLinks.twitter || 'No link added'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side: Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubmitting(false);
                        setCurrentEditingPlatform('x');
                        setTempSocialInput(socialLinks.twitter);
                        setModalStates(prev => ({ ...prev, x: true }));
                      }}
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
                     style={{ 
                       boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                       background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)'
                     }}>
                  <div className="flex items-center justify-between">
                    {/* Left side: Logo and content */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* LinkedIn Logo - Larger */}
                      <div className="w-12 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <FaLinkedin className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title and Link */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          LinkedIn Link
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {socialLinks.linkedin || 'No link added'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side: Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubmitting(false);
                        setCurrentEditingPlatform('linkedin');
                        setTempSocialInput(socialLinks.linkedin);
                        setModalStates(prev => ({ ...prev, linkedin: true }));
                      }}
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
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none font-medium flex items-center justify-center gap-2"
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hidden File Inputs */}
          <input
            ref={profileFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
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
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
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
                  {/* Header with Instagram logo and Remove icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 flex items-center justify-center">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        Instagram Link
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove Instagram Link"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, instagram: '' }));
                        setModalStates(prev => ({ ...prev, instagram: false }));
                        setTempSocialInput('');
                      }}
                      className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Input field */}
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

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, instagram: tempSocialInput }));
                        setModalStates(prev => ({ ...prev, instagram: false }));
                        setTempSocialInput('');
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalStates(prev => ({ ...prev, instagram: false }));
                        setTempSocialInput('');
                      }}
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
                  {/* Header with X logo and Remove icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black border-2 border-gray-600 flex items-center justify-center">
                        <FaXTwitter className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        X Link
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove X Link"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, twitter: '' }));
                        setModalStates(prev => ({ ...prev, x: false }));
                        setTempSocialInput('');
                      }}
                      className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Input field */}
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

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, twitter: tempSocialInput }));
                        setModalStates(prev => ({ ...prev, x: false }));
                        setTempSocialInput('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalStates(prev => ({ ...prev, x: false }));
                        setTempSocialInput('');
                      }}
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
                  {/* Header with LinkedIn logo and Remove icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <FaLinkedin className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        LinkedIn Link
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove LinkedIn Link"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, linkedin: '' }));
                        setModalStates(prev => ({ ...prev, linkedin: false }));
                        setTempSocialInput('');
                      }}
                      className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Input field */}
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

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, linkedin: tempSocialInput }));
                        setModalStates(prev => ({ ...prev, linkedin: false }));
                        setTempSocialInput('');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalStates(prev => ({ ...prev, linkedin: false }));
                        setTempSocialInput('');
                      }}
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
};

export default EditProfilePage;