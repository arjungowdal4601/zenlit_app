import { createClient, type AuthChangeEvent, type AuthOtpResponse, type AuthResponse, type OAuthResponse, type Session } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xgdbkqewkgwlnaaspjpe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZGJrcWV3a2d3bG5hYXNwanBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTI0MDUsImV4cCI6MjA3NDUyODQwNX0._qlVIow7CT193Cs7r1dyiZekC-roGmymwiSP7p24V-E';

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
  // Sign up with email and password
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string; username?: string }
  ): Promise<AuthResponse> =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    }),

  // Sign in with email and password
  signIn: (email: string, password: string): Promise<AuthResponse> =>
    supabase.auth.signInWithPassword({
      email,
      password
    }),

  // Sign in with OTP
  signInWithOtp: (email: string): Promise<AuthOtpResponse> =>
    supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    }),

  // Verify OTP
  verifyOtp: (email: string, token: string, type: 'signup' | 'email' = 'email'): Promise<AuthResponse> =>
    supabase.auth.verifyOtp({
      email,
      token,
      type
    }),

  // Sign in with Google
  signInWithGoogle: (): Promise<OAuthResponse> =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    }),

  // Sign out
  signOut: () => supabase.auth.signOut(),

  // Get current session
  getSession: () => supabase.auth.getSession(),

  // Get current user
  getUser: () => supabase.auth.getUser(),

  // Listen to auth changes
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) =>
    supabase.auth.onAuthStateChange(callback)
};

// Export types for database
export type Tables = {
  posts: {
    id: string;
    created_at: string;
    content: string;
    user_id: string;
    image_url?: string;
  };
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    social_links?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  messages: {
    id: string;
    created_at: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    read: boolean;
  };
  feedback: {
    id: string;
    created_at: string;
    content: string;
    user_id: string;
    category: string;
  };
};