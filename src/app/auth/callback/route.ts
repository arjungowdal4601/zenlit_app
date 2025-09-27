import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_error`);
      }

      // Redirect to home page on successful authentication
      return NextResponse.redirect(`${requestUrl.origin}/home`);
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=unexpected_error`);
    }
  }

  // If no code is present, redirect to sign in
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`);
}