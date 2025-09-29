import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Create a response to allow Supabase to set/refresh auth cookies
    const internalRes = new NextResponse();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Prefer Authorization header if provided by client; fallback to SSR cookies
    const authHeader = request.headers.get('authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let supabase: any;
    if (bearerToken) {
      // Use the provided bearer token for RLS and auth
      supabase = createClient(url, anon, {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      });
    } else {
      // Create authenticated Supabase client with cookie handlers (read + write)
      const cookieStore = await cookies();
      supabase = createServerClient(url, anon, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            internalRes.cookies.set(name, value, options);
          },
          remove(name: string, _options: CookieOptions) {
            internalRes.cookies.delete(name);
          },
        },
      });
    }

    // Ensure request is authenticated; derive userId from auth context
    const { data: { user: authUser }, error: authError } = await (bearerToken
      ? supabase.auth.getUser(bearerToken)
      : supabase.auth.getUser());

    if (authError || !authUser) {
      const response = NextResponse.json({ error: 'Unauthorized: please sign in.' }, { status: 401 });
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    const serverUserId = authUser.id;

    const body = await request.json();
    const { displayName, username, dateOfBirth, gender, email } = body;

    // Validate required fields (userId comes from auth)
    if (!displayName || !username || !email) {
      const response = NextResponse.json(
        { error: 'Missing required fields: displayName, username, and email are required' },
        { status: 400 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    // Check if profile already exists for this authenticated user
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', serverUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      const response = NextResponse.json(
        { error: 'Database error while checking existing profile' },
        { status: 500 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    // If profile exists, update it; otherwise, create new one
    let result;
    if (existingProfile) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          user_name: username,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          email: email,
        })
        .eq('id', serverUserId)
        .select()
        .single();

      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: serverUserId,
          display_name: displayName,
          user_name: username,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          email: email,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error saving profile:', result.error);
      console.error('Error details:', {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
      });

      // Handle specific database errors
      if (result.error.code === '23505') {
        if (result.error.message.includes('user_name')) {
          const response = NextResponse.json(
            { error: 'Username is already taken. Please choose a different username.' },
            { status: 409 }
          );
          const setCookie = internalRes.headers.get('set-cookie');
          if (setCookie) response.headers.set('set-cookie', setCookie);
          return response;
        }
        if (result.error.message.includes('email')) {
          const response = NextResponse.json(
            { error: 'Email is already registered. Please use a different email.' },
            { status: 409 }
          );
          const setCookie = internalRes.headers.get('set-cookie');
          if (setCookie) response.headers.set('set-cookie', setCookie);
          return response;
        }
      }

      const response = NextResponse.json(
        { error: result.error.message || 'Failed to save profile data' },
        { status: 500 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      profile: result.data,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
    });
    const setCookie = internalRes.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}