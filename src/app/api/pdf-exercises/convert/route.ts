import { NextResponse } from 'next/server';

// Placeholder PDF conversion route — implement actual conversion later
export async function POST() {
	return NextResponse.json({ ok: true, message: 'Conversion non implémentée' });
}

export async function GET() {
	return NextResponse.json({ ok: true });
}
