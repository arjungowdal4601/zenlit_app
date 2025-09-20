"use client";

import type { CSSProperties } from 'react';
import { SOCIAL_PLATFORMS, type SocialPlatformId } from '@/constants/socialPlatforms';
import { mergeClassNames } from '@/utils/classNames';

interface SocialLinkButtonProps {
  platform: SocialPlatformId;
  onClick?: () => void;
  buttonClassName?: string;
  containerClassName?: string;
  iconClassName?: string;
  containerStyle?: CSSProperties;
  ariaLabel?: string;
}

const SocialLinkButton = ({
  platform,
  onClick,
  buttonClassName,
  containerClassName,
  iconClassName,
  containerStyle,
  ariaLabel,
}: SocialLinkButtonProps) => {
  const meta = SOCIAL_PLATFORMS[platform];

  return (
    <button
      type="button"
      onClick={onClick}
      className={mergeClassNames('p-0 transition-transform duration-200', buttonClassName)}
      aria-label={ariaLabel ?? meta.label}
    >
      <div
        className={mergeClassNames(meta.wrapperClassName, containerClassName)}
        style={{ ...meta.style, ...containerStyle }}
      >
        {meta.renderIcon(mergeClassNames(meta.iconClassName ?? '', iconClassName ?? ''))}
      </div>
    </button>
  );
};

export default SocialLinkButton;
