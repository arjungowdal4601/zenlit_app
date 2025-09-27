'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth, supabase } from '@/utils/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { full_name?: string; username?: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithOtp: (email: string) => Promise<{ data: any; error: any }>;
  verifyOtp: (email: string, token: string, type?: 'signup' | 'email') => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user } = useAuth();
  return user;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create or update profile when user signs up or signs in
      if (event === 'SIGNED_IN' && session?.user) {
        await createOrUpdateProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create or update user profile in the profiles table
  const createOrUpdateProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: null,
            social_links: null
          });

        if (error) {
          console.error('Error creating profile:', error);
        }
      } else {
        // Update existing profile with any new metadata
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || existingProfile.full_name,
            avatar_url: user.user_metadata?.avatar_url || existingProfile.avatar_url
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating profile:', error);
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithOtp: auth.signInWithOtp,
    verifyOtp: auth.verifyOtp,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};