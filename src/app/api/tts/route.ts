import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    const text: string = body?.text || '';
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }
  let voice: string = body?.voice || process.env.TTS_VOICE || 'alloy';
  voice = String(voice).toLowerCase();
  const allowed = new Set(['alloy','verse','aria','luna','maya','sage']);
  if (!allowed.has(voice)) voice = 'alloy';
    const format: 'mp3' | 'wav' | 'ogg' = body?.format || 'mp3';
  const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';

    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Create speech with OpenAI TTS
    const speech = await client.audio.speech.create({
      model,
      voice,
      input: text,
      format,
    } as any);
    // SDK returns a fetch-like Response
    const arrayBuffer = await speech.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const contentType = format === 'mp3' ? 'audio/mpeg' : format === 'ogg' ? 'audio/ogg' : 'audio/wav';
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error('TTS error', e);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
