import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://62.171.160.71:3025';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/wallets`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend request failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to proxy /api/wallets:', err);
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}