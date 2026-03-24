import { NextResponse } from 'next/server';
import http from 'http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fetchHttp(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://62.171.160.71:3025';

export async function GET() {
  try {
    const data = await fetchHttp(`${BACKEND_URL}/api/holders`);
    return new NextResponse(data, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to proxy /api/holders:', err);
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}