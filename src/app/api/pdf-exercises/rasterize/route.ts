import { NextResponse } from 'next/server';

// Rasterization is available via the Node script `npm run rasterize:all`.
export async function GET() {
  return NextResponse.json({ ok: true, note: 'Use npm run rasterize:all to generate images for all PDFs.' });
}

export async function POST() {
  return NextResponse.json({ ok: false, error: 'Rasterize via CLI only (npm run rasterize:all).' }, { status: 400 });
}
