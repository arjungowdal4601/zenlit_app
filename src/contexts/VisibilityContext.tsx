"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_VISIBLE_PLATFORMS, type SocialPlatformId } from '@/constants/socialPlatforms';

interface VisibilityContextType {
  isVisible: boolean;
  selectedAccounts: SocialPlatformId[];
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedAccounts: Dispatch<SetStateAction<SocialPlatformId[]>>;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
};

interface VisibilityProviderProps {
  children: ReactNode;
}

export const VisibilityProvider = ({ children }: VisibilityProviderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<SocialPlatformId[]>(() => [...DEFAULT_VISIBLE_PLATFORMS]);

  const value = useMemo(
    () => ({
      isVisible,
      selectedAccounts,
      setIsVisible,
      setSelectedAccounts,
    }),
    [isVisible, selectedAccounts],
  );

  return (
    <VisibilityContext.Provider value={value}>
      {children}
    </VisibilityContext.Provider>
  );
};
