'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Paperclip, X, Check } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import { uploadFeedbackImage } from '@/utils/supabaseStorage';
import { compressImage, validateImageFile } from '@/utils/imageCompression';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';

const FeedbackPage = () => {
  const router = useRouter();
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ feedbackText?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Compress the image to meet the 550KB target used by our utility
      const result = await compressImage(file);
      if (!result.success || !result.file) {
        alert(result.error || 'Failed to compress image below target size.');
        return;
      }

      const compressedFile = result.file;
      setSelectedImage(compressedFile);

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: { feedbackText?: string } = {};
    
    if (!feedbackText.trim()) {
      newErrors.feedbackText = 'Feedback text is required';
    } else if (feedbackText.trim().length < 10) {
      newErrors.feedbackText = 'Feedback must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setErrors({ feedbackText: 'Please sign in to submit feedback.' });
        return;
      }

      // Upload image if selected
      let uploadedImageUrl = null;
      if (selectedImage) {
        try {
          const uploadResult = await uploadFeedbackImage(selectedImage, user.id);
          
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
          
          uploadedImageUrl = uploadResult.url;
        } catch (uploadException) {
          console.error('Unexpected feedback image upload error:', uploadException);
          throw uploadException;
        }
      }

      // Insert feedback into backend table
      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          text: feedbackText.trim(),
          image_url: uploadedImageUrl,
        });

      if (insertError) {
        console.error('Error inserting feedback:', insertError);
        throw insertError;
      }

      // Show success message
      setShowSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFeedbackText('');
        setSelectedImage(null);
        setImagePreview(null);
        setShowSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader
            title="Feedback"
            left={(
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
          />

          {/* Header Section */}
          <div className="mb-8 mt-4">
            <div className="text-center">
              <h1 
                className="text-lg mb-4 tracking-tight font-medium text-white"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                We Value Your Feedback
              </h1>
              <p 
                className="text-gray-300 text-lg max-w-md mx-auto"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Help us improve Zenlit by sharing your thoughts and suggestions
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Feedback attachment preview"
                  width={800}
                  height={512}
                  className="w-full max-h-64 object-cover rounded-xl border-2 border-white"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-600 rounded-xl flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-300" style={{ fontFamily: 'var(--font-inter)' }}>
                Thank you! Your feedback has been submitted successfully.
              </span>
            </div>
          )}

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pb-8">
            {/* Feedback Text Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label 
                  htmlFor="feedback-text"
                  className="block text-white font-medium"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Your Feedback <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  title="Attach image"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm font-medium">Attach</span>
                </button>
                {selectedImage && (
                  <p className="mt-2 text-xs text-gray-400" style={{ fontFamily: 'var(--font-inter)' }}>
                    <span className="font-medium text-gray-200">Attached:</span> {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                  </p>
                )}
              </div>
              <textarea
                id="feedback-text"
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  if (errors.feedbackText) {
                    setErrors({ ...errors, feedbackText: undefined });
                  }
                }}
                placeholder="Tell us what you think about Zenlit. What features do you love? What could be improved? Any bugs or issues you've encountered?"
                rows={6}
                className={`w-full bg-black border border-white rounded-xl px-4 py-3 text-gray-400 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 transition-colors ${
                  errors.feedbackText 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white focus:ring-white'
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
                maxLength={1000}
              />
              {errors.feedbackText && (
                <p className="mt-2 text-red-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                  {errors.feedbackText}
                </p>
              )}
              <p className="mt-2 text-gray-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                {feedbackText.length}/1000 characters
              </p>
              {feedbackText.trim().length > 0 && feedbackText.trim().length < 10 && !errors.feedbackText && (
                <p className="mt-1 text-xs text-blue-400" style={{ fontFamily: 'var(--font-inter)' }}>
                  Enter at least 10 characters.
                </p>
              )}
            </div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || showSuccess || feedbackText.trim().length === 0}
              className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${
                isSubmitting || showSuccess || feedbackText.trim().length === 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {isSubmitting ? 'Submitting...' : showSuccess ? 'Submitted!' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedbackPage;
