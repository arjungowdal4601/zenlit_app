'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import { ArrowLeft, Camera, X, Check, Save, Upload, Edit, Instagram, Trash2 } from 'lucide-react';
import { FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import Image from 'next/image';
import {
  fetchCurrentUserProfile,
  getProfilePictureUrl,
  getBannerUrl,
  getSocialMediaLinks,
  updateUserProfile,
  updateSocialLinks,
  type CompleteUserProfile,
} from '@/utils/profileData';
  import { uploadProfileImage, replaceProfileImage } from '@/utils/supabaseStorage';
  import { supabase } from '@/utils/supabaseClient';
  import { compressImage, validateImageFile, formatFileSize } from '@/utils/imageCompression';

  const EditProfilePage = () => {
    // Helper: extract username/handle from a social link or handle
    const extractUsername = (value?: string | null) => {
      if (!value) return 'No link added';
      const trimmed = value.trim();
      if (!trimmed) return 'No link added';
      // If starts with @, treat remainder as username
      if (trimmed.startsWith('@')) return trimmed.slice(1);
      // If it's a full URL, parse the pathname and take last non-empty segment
      try {
        const u = new URL(trimmed);
        const parts = u.pathname.split('/').filter(Boolean);
        if (!parts.length) return u.hostname;
        // Special handling for LinkedIn /in/<username>
        const inIndex = parts.indexOf('in');
        if (inIndex >= 0 && parts[inIndex + 1]) return parts[inIndex + 1];
        return parts[parts.length - 1];
      } catch {
        // Not a URL: if it contains slashes, take last segment; else return as-is
        const pseudoParts = trimmed.split('/').filter(Boolean);
        return pseudoParts.length ? pseudoParts[pseudoParts.length - 1] : trimmed;
      }
    };
  const router = useRouter();
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=b6e3f4',
    bannerImage: null as string | null,
  });

  const [initialProfileData, setInitialProfileData] = useState({
    displayName: '',
    bio: '',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=b6e3f4',
    bannerImage: null as string | null,
  });

  // State for social links
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    x: '',
    linkedin: ''
  });

  const [initialSocialLinks, setInitialSocialLinks] = useState({
    instagram: '',
    x: '',
    linkedin: ''
  });

  // Social validation state
  // Modal states for editing social links
  const [modalStates, setModalStates] = useState({
    instagram: false,
    x: false,
    linkedin: false
  });

  // Temporary input state for modal editing
  const [tempSocialInput, setTempSocialInput] = useState('');
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
  
  // File states for tracking actual file uploads
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  
  // File input refs
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const prepareImageForUpload = async (file: File, type: 'profile' | 'banner') => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error ?? 'Please choose a valid image file.');
      return;
    }

    try {
      const compressionResult = await compressImage(file);
      if (!compressionResult.success || !compressionResult.file) {
        alert(compressionResult.error ?? 'Failed to process image. Please try a different file.');
        return;
      }

      const { file: preparedFile, originalSize, compressedSize } = compressionResult;

      if (originalSize && compressedSize && originalSize !== compressedSize) {
        console.info(
          `[Zenlit] ${type} image compressed from ${formatFileSize(originalSize)} to ${formatFileSize(compressedSize)}.`
        );
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          return;
        }

        if (type === 'profile') {
          setProfileData((prev) => ({ ...prev, profileImage: result }));
        } else {
          setProfileData((prev) => ({ ...prev, bannerImage: result }));
        }
      };
      reader.onerror = () => {
        console.error('Image preview generation failed for', type, 'image');
        alert('Could not generate a preview for the selected image.');
      };
      reader.readAsDataURL(preparedFile);

      if (type === 'profile') {
        setProfileImageFile(preparedFile);
      } else {
        setBannerImageFile(preparedFile);
      }
    } catch (error) {
      console.error('Image preparation error:', error);
      alert('Failed to process image. Please try again with a different file.');
    }
  };

  const handleBack = () => {
    router.push('/profile');
  };

  // Regex validation functions for social links
  // Handle social link changes with validation
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
    setBannerImageFile(null);
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = '';
    }
    setShowBannerMenu(false);
  };

  // Profile image handlers
  const handleProfileImageSelect = () => {
    profileFileInputRef.current?.click();
    setShowProfileMenu(false);
  };

  const handleRemoveProfileImage = () => {
    setProfileData(prev => ({ ...prev, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4' }));
    setProfileImageFile(null);
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = '';
    }
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
    
    // Initialize image URLs with current values
    let profilePicUrl = profileData.profileImage;
    let bannerUrl = profileData.bannerImage;
    
    try {
      // Update profile (display name)
      const profileUpdate = { display_name: profileData.displayName };
      await updateUserProfile(profileUpdate);

      // Get current user ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Error getting user:', authError);
        alert('Authentication error. Please sign in again.');
        return;
      }

      // Handle image uploads if files were selected
      if (profileImageFile) {
        try {
          let uploadResult;
          if (initialProfileData.profileImage && !initialProfileData.profileImage.includes('dicebear.com')) {
            // Replace existing image
            uploadResult = await replaceProfileImage(profileImageFile, user.id, 'profile', initialProfileData.profileImage);
          } else {
            // Upload new image
            uploadResult = await uploadProfileImage(profileImageFile, user.id, 'profile');
          }
          
          if (uploadResult.success && uploadResult.url) {
            profilePicUrl = uploadResult.url;
          } else {
            console.error('Profile image upload failed:', uploadResult.error);
          }
        } catch (error) {
          console.error('Error uploading profile image:', error);
        }
      }
      
      if (bannerImageFile) {
        try {
          let uploadResult;
          if (initialProfileData.bannerImage) {
            // Replace existing banner
            uploadResult = await replaceProfileImage(bannerImageFile, user.id, 'banner', initialProfileData.bannerImage);
          } else {
            // Upload new banner
            uploadResult = await uploadProfileImage(bannerImageFile, user.id, 'banner');
          }
          
          if (uploadResult.success && uploadResult.url) {
            bannerUrl = uploadResult.url;
          } else {
            console.error('Banner image upload failed:', uploadResult.error);
          }
        } catch (error) {
          console.error('Error uploading banner image:', error);
        }
      }

      // Update social links (bio + social links + images)
      const socialUpdate = {
        bio: profileData.bio || undefined,
        instagram: socialLinks.instagram || undefined,
        x_twitter: socialLinks.x || undefined,
        linkedin: socialLinks.linkedin || undefined,
        profile_pic_url: profilePicUrl || undefined,
        banner_url: bannerUrl || undefined,
      };
      await updateSocialLinks(socialUpdate);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Stay on the Edit Profile page; do not redirect
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
      // Refresh initial state after successful save
      const updatedProfileData = {
        ...profileData,
        profileImage: profilePicUrl,
        bannerImage: bannerUrl
      };
      setProfileData(updatedProfileData);
      setInitialProfileData(updatedProfileData);
      setInitialSocialLinks(socialLinks);
      
      // Clear file states
      setProfileImageFile(null);
      setBannerImageFile(null);
    }
  };

  // Load current profile from backend
  useEffect(() => {
    (async () => {
      const data = await fetchCurrentUserProfile();
      if (!data) return;
      const social = getSocialMediaLinks(data.socialLinks);
      const displayName = data.profile.display_name || '';
      const bio = social.bio || '';
      const profileImage = getProfilePictureUrl(data.socialLinks);
      const bannerImage = getBannerUrl(data.socialLinks);

      const loadedProfile = { displayName, bio, profileImage, bannerImage };
      setProfileData(loadedProfile);
      setInitialProfileData(loadedProfile);

      const loadedSocial = {
        instagram: social.instagram || '',
        x: social.twitter || '',
        linkedin: social.linkedin || '',
      };
      setSocialLinks(loadedSocial);
      setInitialSocialLinks(loadedSocial);
    })();
  }, []);

  // Determine if form has changes
  const hasChanges = useMemo(() => {
    const profileChanged =
      profileData.displayName !== initialProfileData.displayName ||
      profileData.bio !== initialProfileData.bio ||
      profileData.profileImage !== initialProfileData.profileImage ||
      profileData.bannerImage !== initialProfileData.bannerImage;

    const socialChanged =
      socialLinks.instagram !== initialSocialLinks.instagram ||
      socialLinks.x !== initialSocialLinks.x ||
      socialLinks.linkedin !== initialSocialLinks.linkedin;

    return profileChanged || socialChanged;
  }, [profileData, socialLinks, initialProfileData, initialSocialLinks]);

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
                          Instagram
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {extractUsername(socialLinks.instagram)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side: Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubmitting(false);
                       
                        setTempSocialInput(socialLinks.instagram);
                        setModalStates(prev => ({ ...prev, instagram: true }));
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <Edit className="w-4 h-4" aria-label="Edit link" />
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
                      <div className="w-12 h-12 rounded-lg bg-black border-2 border-gray-600 flex items-center justify-center flex-shrink-0">
                        <FaXTwitter className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title and Link */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                          X
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {extractUsername(socialLinks.x)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side: Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubmitting(false);
                       
                        setTempSocialInput(socialLinks.x);
                        setModalStates(prev => ({ ...prev, x: true }));
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <Edit className="w-4 h-4" aria-label="Edit link" />
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
                          LinkedIn
                        </h3>
                        <p className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                          {extractUsername(socialLinks.linkedin)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side: Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubmitting(false);
                       
                        setTempSocialInput(socialLinks.linkedin);
                        setModalStates(prev => ({ ...prev, linkedin: true }));
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <Edit className="w-4 h-4" aria-label="Edit link" />
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
                disabled={!hasChanges || isSubmitting}
                className={`flex-1 px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  hasChanges && !isSubmitting
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
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                return;
              }
              await prepareImageForUpload(file, 'profile');
              e.target.value = '';
            }}
            className="hidden"
          />
          <input
            ref={bannerFileInputRef}
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                return;
              }
              await prepareImageForUpload(file, 'banner');
              e.target.value = '';
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
                        Instagram
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove Instagram"
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
                        X
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove X"
                      onClick={() => {
                        setSocialLinks(prev => ({ ...prev, x: '' }));
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
                        setSocialLinks(prev => ({ ...prev, x: tempSocialInput }));
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
                        LinkedIn
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove LinkedIn"
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
