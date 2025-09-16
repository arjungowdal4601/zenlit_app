'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface EditablePostProps {
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  initialContent?: string;
  onSave?: (content: string, image?: File) => void;
}

const EditablePost = ({ author, initialContent = '', onSave }: EditablePostProps) => {
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

          {showAttachPopup && (
            <div className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg shadow-lg p-2 min-w-[120px] z-20">
              <button
                onClick={handleCameraSelect}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                <span>Camera</span>
              </button>
              <button
                onClick={handleGallerySelect}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span>Gallery</span>
              </button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
                placeholder="What's happening?"
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

