'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VisibilityContextType {
  isVisible: boolean;
  selectedAccounts: string[];
  setIsVisible: (visible: boolean) => void;
  setSelectedAccounts: (accounts: string[]) => void;
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

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['instagram', 'linkedin', 'twitter']);

  const value = {
    isVisible,
    selectedAccounts,
    setIsVisible,
    setSelectedAccounts,
  };

  return (
    <VisibilityContext.Provider value={value}>
      {children}
    </VisibilityContext.Provider>
  );
};