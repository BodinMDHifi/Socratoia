import { NextResponse } from 'next/server';

// Placeholder OCR route (no external deps). Extend later with a proper OCR service.
export async function POST() {
	return NextResponse.json({ ok: false, error: 'OCR non implémenté' }, { status: 501 });
}

export async function GET() {
	return NextResponse.json({ ok: true });
}
