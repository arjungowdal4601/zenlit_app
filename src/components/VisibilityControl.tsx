'use client';

import React, { useState } from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Eye, EyeOff, Slash } from 'lucide-react';

interface VisibilityControlProps {
  onVisibilityChange?: (isVisible: boolean) => void;
  onAccountsChange?: (selectedAccounts: string[]) => void;
}

const VisibilityControl: React.FC<VisibilityControlProps> = ({
  onVisibilityChange,
  onAccountsChange
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['instagram', 'linkedin', 'twitter']);

  const socialAccounts = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: FaInstagram,
      gradient: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: FaLinkedin,
      gradient: '#0077B5'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: FaXTwitter,
      gradient: '#000000'
    }
  ];

  const handleVisibilityToggle = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onVisibilityChange?.(newVisibility);
  };

  const handleAccountToggle = (accountId: string) => {
    const newSelectedAccounts = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    
    setSelectedAccounts(newSelectedAccounts);
    onAccountsChange?.(newSelectedAccounts);
  };

  const handleDeselectAll = () => {
    setSelectedAccounts([]);
    onAccountsChange?.([]);
  };

  const handleSelectAll = () => {
    const allAccountIds = socialAccounts.map(account => account.id);
    setSelectedAccounts(allAccountIds);
    onAccountsChange?.(allAccountIds);
  };

  return (
    <div className="bg-black rounded-xl p-4 mb-4 transition-all duration-300" style={{boxShadow: '4px 4px 8px rgba(255, 255, 255, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1)'}}>
      {/* Header with Global Visibility Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-white font-medium text-sm">Visibility</span>
          <button
            onClick={handleVisibilityToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              isVisible ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
               className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                 isVisible ? 'translate-x-6' : 'translate-x-1'
               }`}
             />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            disabled={selectedAccounts.length === socialAccounts.length}
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
          {socialAccounts.map((account) => {
            const isSelected = selectedAccounts.includes(account.id);
            const IconComponent = account.icon;
            
            return (
              <button
                key={account.id}
                onClick={() => handleAccountToggle(account.id)}
                className={`relative flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-white/20 bg-white/5 hover:bg-white/10'
                    : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                {/* Social Icon */}
                <div className="relative flex-shrink-0">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isSelected ? '' : 'grayscale'
                    }`}
                    style={{
                      background: isSelected ? account.gradient : '#4B5563',
                    }}
                  >
                    <IconComponent 
                      className={`w-5 h-5 ${
                        account.id === 'instagram' || account.id === 'twitter' 
                          ? 'text-white' 
                          : account.id === 'linkedin' 
                            ? 'text-white' 
                            : 'text-white'
                      }`} 
                    />
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
                  className={`text-sm font-medium transition-colors ${
                    isSelected ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {account.name}
                </span>
                
                {/* Selection Indicator */}
                <div className="flex-1 flex justify-end">
                  <div 
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-500'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
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