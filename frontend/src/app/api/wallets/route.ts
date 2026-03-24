export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://62.171.160.71:3025';

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${BACKEND_URL}/api/wallets`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend request failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    clearTimeout(timeout);
    console.error('Proxy /api/wallets failed:', String(err));
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}