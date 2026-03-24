import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://62.171.160.71:3025';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/wallets`, {
      next: { revalidate: 60 }, // cache for 60 seconds
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend request failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}
