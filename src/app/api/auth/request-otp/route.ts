import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { email, shouldCreateUser } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Default to auto-creating users unless explicitly disabled by caller (signin flow)
        shouldCreateUser: shouldCreateUser === false ? false : true,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}