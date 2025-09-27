import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xgdbkqewkgwlnaaspjpe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZGJrcWV3a2d3bG5hYXNwanBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTI0MDUsImV4cCI6MjA3NDUyODQwNX0._qlVIow7CT193Cs7r1dyiZekC-roGmymwiSP7p24V-E';

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: { full_name?: string; username?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with OTP
  signInWithOtp: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });
    return { data, error };
  },

  // Verify OTP
  verifyOtp: async (email: string, token: string, type: 'signup' | 'email' = 'email') => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
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