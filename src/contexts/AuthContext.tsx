'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  AuthChangeEvent,
  AuthError,
  AuthOtpResponse,
  AuthResponse,
  OAuthResponse,
  Session,
  User
} from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import type { Tables } from '@/utils/supabase';

type ProfileRow = Tables['profiles'];

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string; username?: string }
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithOtp: (email: string) => Promise<AuthOtpResponse>;
  verifyOtp: (
    email: string,
    token: string,
    type?: 'signup' | 'email'
  ) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<OAuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      if (error) {
        console.error('Error fetching initial session:', error);
        setLoading(false);
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && newSession?.user) {
          void createOrUpdateProfile(newSession.user);
        }
      }
    );

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const createOrUpdateProfile = async (authUser: User) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const existingProfile = profileData as ProfileRow | null;

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: authUser.id,
          username:
            authUser.user_metadata?.username ||
            authUser.email?.split('@')[0] ||
            'user',
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            '',
          avatar_url: authUser.user_metadata?.avatar_url || null,
          bio: null,
          social_links: null
        });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            existingProfile.full_name,
          avatar_url:
            authUser.user_metadata?.avatar_url || existingProfile.avatar_url
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  const signUp: AuthContextValue['signUp'] = (email, password, userData) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });

  const signIn: AuthContextValue['signIn'] = (email, password) =>
    supabase.auth.signInWithPassword({
      email,
      password
    });

  const signInWithOtp: AuthContextValue['signInWithOtp'] = (email) =>
    supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });

  const verifyOtp: AuthContextValue['verifyOtp'] = (email, token, type = 'email') =>
    supabase.auth.verifyOtp({
      email,
      token,
      type
    });

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });

  const signOut: AuthContextValue['signOut'] = () => supabase.auth.signOut();

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}
