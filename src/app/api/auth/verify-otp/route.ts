import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, code, type = 'email' } = await req.json();
    
    if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Verify OTP using Supabase Auth
    const { data, error } = await auth.verifyOtp(email, code, type);

    if (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.json({ 
        error: 'Invalid or expired code', 
        details: error.message 
      }, { status: 400 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ 
        error: 'Authentication failed' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'OTP verified successfully',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Unexpected error in verify-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}