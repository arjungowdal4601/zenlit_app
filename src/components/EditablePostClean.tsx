'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface EditablePostProps {
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  initialContent?: string;
  onSave?: (content: string, image?: File) => void;
  disabled?: boolean;
}

const EditablePost = ({ author, initialContent = '', onSave, disabled = false }: EditablePostProps) => {
  const [content, setContent] = useState(initialContent);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAttachPopup, setShowAttachPopup] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => setShowAttachPopup((v) => !v);
  const handleGallerySelect = () => {
    fileInputRef.current?.click();
    setShowAttachPopup(false);
  };
  const handleCameraSelect = () => {
    cameraInputRef.current?.click();
    setShowAttachPopup(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (onSave) onSave(content, selectedImage || undefined);
    else console.log('Share post', { content, hasImage: !!selectedImage });
  };

  return (
    <div className="mb-3 relative">
      {/* Top Controls - Attach Icon and Share Button */}
      <div className="absolute top-0 right-0 z-10 flex items-center space-x-2">
        {/* Attach Icon with Popup */}
        <div className="relative">
          <button
            onClick={handleAttachClick}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Attach File"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Image Selection Modal */}
          {showAttachPopup && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div
                className="bg-black border border-white/20 rounded-2xl p-6 max-w-sm w-full mx-4 relative"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)' }}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowAttachPopup(false)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
                  aria-label="Close image source selector"
                >
                  ✕
                </button>

                {/* Modal content */}
                <h3 className="text-white text-lg font-semibold mb-6 text-center">Choose Image Source</h3>

                {/* Action buttons */}
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleCameraSelect}
                    className="flex items-center justify-center space-x-4 px-6 py-4 bg-black text-white rounded-xl transition-colors border border-white/30 hover:border-white/70 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <div className="p-2 rounded-full border border-white/40 bg-black">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-medium">Camera</span>
                  </button>

                  <button
                    onClick={handleGallerySelect}
                    className="flex items-center justify-center space-x-4 px-6 py-4 bg-black text-white rounded-xl transition-colors border border-white/30 hover:border-white/70 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <div className="p-2 rounded-full border border-white/40 bg-black">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-medium">Gallery</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleSave}
          disabled={disabled}
          className={`px-4 py-2 ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors font-medium`}
        >
          Share
        </button>
      </div>

      <div className="relative bg-black rounded-xl p-4 transition-all duration-300">
        <div className="flex space-x-4">
          {/* Profile Picture (Feed-style) */}
          <div className="flex-shrink-0">
            <Image
              src={
                author.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&color=fff&size=40`
              }
              alt={author.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
            />
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="mb-3">
              <h3 className="text-white font-medium text-sm leading-tight">{author.name}</h3>
              <span className="text-gray-400 text-xs leading-tight">@{author.username}</span>
            </div>

            {/* Editable Text */}
            <div className="mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts with the world! What's on your mind today?"
                className="w-full bg-transparent text-gray-100 placeholder-gray-400 text-base resize-none border-none outline-none min-h-[120px] leading-relaxed"
                style={{ fontFamily: 'inherit' }}
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 relative">
                <Image src={imagePreview} alt="Selected image" width={600} height={400} className="w-full max-w-md rounded-xl object-cover" />
                <button
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};

export default EditablePost;

