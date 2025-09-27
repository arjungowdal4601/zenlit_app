import {
  createClient,
  type AuthChangeEvent,
  type AuthOtpResponse,
  type AuthResponse,
  type OAuthResponse,
  type Session,
} from '@supabase/supabase-js';
import type { Database } from './supabase.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables = {
  [K in keyof Database['public']['Tables']]: Database['public']['Tables'][K]['Row'];
};

export type TablesInsert = {
  [K in keyof Database['public']['Tables']]: Database['public']['Tables'][K]['Insert'];
};

export type TablesUpdate = {
  [K in keyof Database['public']['Tables']]: Database['public']['Tables'][K]['Update'];
};

export const auth = {
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string; username?: string }
  ): Promise<AuthResponse> =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    }),

  signIn: (email: string, password: string): Promise<AuthResponse> =>
    supabase.auth.signInWithPassword({
      email,
      password,
    }),

  signInWithOtp: (email: string): Promise<AuthOtpResponse> =>
    supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    }),

  verifyOtp: (
    email: string,
    token: string,
    type: 'signup' | 'email' = 'email'
  ): Promise<AuthResponse> =>
    supabase.auth.verifyOtp({
      email,
      token,
      type,
    }),

  signInWithGoogle: (): Promise<OAuthResponse> =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  getUser: () => supabase.auth.getUser(),

  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) =>
    supabase.auth.onAuthStateChange(callback),
};

export const getPublicStorageUrl = (bucket: string, path: string) =>
  supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

export const uploadUserFile = async (
  bucket: 'avatars' | 'banners',
  userId: string,
  file: File
): Promise<string> => {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${userId}/${timestamp}-${safeName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return getPublicStorageUrl(bucket, data.path);
};

export type { Database };
