import { NextResponse } from 'next/server';

// Minimal placeholder validator route to satisfy typechecking/build
export async function POST(req: Request) {
	try {
		const body = await req.json();
		// Echo back as a no-op validation (extend later with actual chemistry checks)
		return NextResponse.json({ ok: true, input: body });
	} catch {
		return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
	}
}

export async function GET() {
	return NextResponse.json({ ok: true });
}
