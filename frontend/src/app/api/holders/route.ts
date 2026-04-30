import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'snapshot-final.json');
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Snapshot unavailable' }, { status: 500 });
  }
}
