import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://62.171.160.71:3025';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/wallets`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}