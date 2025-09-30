"use client";

import React from 'react';
import { Slash } from 'lucide-react';
import { SOCIAL_PLATFORM_IDS, SOCIAL_PLATFORMS, type SocialPlatformId } from '@/constants/socialPlatforms';
import { useVisibility } from '@/contexts/VisibilityContext';
import { mergeClassNames } from '@/utils/classNames';

const VisibilityControl: React.FC = () => {
  const { isVisible, selectedAccounts, setIsVisible, setSelectedAccounts } = useVisibility();

  const handleVisibilityToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const handleAccountToggle = (accountId: SocialPlatformId) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    );
  };

  const handleDeselectAll = () => {
    setSelectedAccounts([]);
  };

  const handleSelectAll = () => {
    setSelectedAccounts(() => [...SOCIAL_PLATFORM_IDS]);
  };

  return (
    <div className="bg-black rounded-xl p-4 mb-4 transition-all duration-300" style={{ boxShadow: '4px 4px 8px rgba(255, 255, 255, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1)' }}>
      {/* Header with Global Visibility Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-white font-semibold text-sm tracking-wide">Visibility</span>
          <button
            onClick={handleVisibilityToggle}
            aria-label="Toggle visibility"
            className='relative inline-flex h-6 w-12 items-center rounded-full bg-transparent p-0.5 focus:outline-none'
          >
            {/* Track */}
            <span
              aria-hidden
              className={mergeClassNames(
                'absolute inset-0 rounded-full transition-colors duration-200 ring-1',
                isVisible ? 'bg-[#1d9bf0] ring-[#1d9bf0]/60' : 'bg-gray-600/70 ring-white/20'
              )}
            />
            {/* Knob */}
            <span
              className={mergeClassNames(
                'relative inline-flex h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200',
                isVisible ? 'translate-x-6' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            disabled={selectedAccounts.length === SOCIAL_PLATFORM_IDS.length}
          >
            Select All
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={handleDeselectAll}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            disabled={selectedAccounts.length === 0}
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Account Selection Interface */}
      <div className="space-y-3">
        <h4 className="text-gray-200 font-medium text-sm mb-3">
          Social Account Visibility
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SOCIAL_PLATFORM_IDS.map((accountId) => {
            const meta = SOCIAL_PLATFORMS[accountId];
            const isSelected = selectedAccounts.includes(accountId);

            return (
              <button
                key={accountId}
                onClick={() => handleAccountToggle(accountId)}
                className={mergeClassNames(
                  'relative flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200',
                  isSelected
                    ? 'border-white/20 bg-white/5 hover:bg-white/10'
                    : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50',
                )}
              >
                {/* Social Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={mergeClassNames(
                      'w-8 h-8 transition-all duration-200',
                      meta.wrapperClassName,
                      isSelected ? '' : 'grayscale',
                    )}
                    style={isSelected ? meta.style : { background: '#4B5563' }}
                  >
                    {meta.renderIcon(mergeClassNames('w-5 h-5', meta.iconClassName ?? ''))}
                  </div>

                  {/* Slash overlay for deselected accounts */}
                  {!isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Slash className="w-6 h-6 text-gray-400" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Account Name */}
                <span
                  className={mergeClassNames(
                    'text-sm font-medium transition-colors',
                    isSelected ? 'text-white' : 'text-gray-400',
                  )}
                >
                  {meta.label}
                </span>

                {/* Selection Indicator */}
                <div className="flex-1 flex justify-end">
                  <div
                    className={mergeClassNames(
                      'w-4 h-4 rounded-full border-2 transition-all duration-200',
                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-500',
                    )}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default VisibilityControl;
