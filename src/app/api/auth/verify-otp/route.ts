import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Accept only the fixed demo code 000000
    const ok = code === '000000';
    if (!ok) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // In a real app, create session here; for now just respond ok for onboarding
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}