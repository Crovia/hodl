import { NextResponse } from 'next/server';
import { batchResolveCronosIds } from '@/lib/cronosIdService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { addresses } = await req.json();

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({}, { status: 400 });
    }

    // Max 50 per request
    const batch = addresses.slice(0, 50);
    const result = await batchResolveCronosIds(batch);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}