import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Send OTP using Supabase Auth
    const { data, error } = await auth.signInWithOtp(email);

    if (error) {
      console.error('Error sending OTP:', error);
      return NextResponse.json({ 
        error: 'Failed to send OTP', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'OTP sent successfully',
      data: data
    });
  } catch (error) {
    console.error('Unexpected error in request-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}