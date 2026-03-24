import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3025';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/holders`, {
      next: { revalidate: 30 }, // cache for 30 seconds
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Backend request failed' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to proxy /api/holders:', err);
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 502 }
    );
  }
}
