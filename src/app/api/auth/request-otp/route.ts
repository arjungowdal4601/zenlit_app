import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // In a real app, you would generate and email an OTP here.
    // For this prototype, we always "send" the fixed 6-digit code 000000
    const devCode = '000000';

    return NextResponse.json({ ok: true, devCode });
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}