import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Very lightweight sentence splitter (French friendly punctuation)
function splitIntoChunks(text: string, maxLen = 220) {
  const raw = text.replace(/\s+/g, ' ').trim();
  if (!raw) return [] as string[];
  const sentences = raw.split(/(?<=[.!?])\s+(?=[A-ZÉÈÀÂÎÔÙÛÎÄÔÙ])/u); // naive capital-based split
  const merged: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf + ' ' + s).trim().length > maxLen && buf) { merged.push(buf.trim()); buf = s; } else { buf = (buf + ' ' + s).trim(); }
  }
  if (buf) merged.push(buf.trim());
  return merged.filter(Boolean);
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }
    const body = await req.json().catch(()=>({}));
    const text: string = body?.text || '';
    const voiceInput: string | undefined = body?.voice;
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
    let voice = (voiceInput || process.env.TTS_VOICE || 'alloy').toLowerCase();
    const allowed = new Set(['alloy','verse','aria','luna','maya','sage']);
    if (!allowed.has(voice)) voice = 'alloy';
    const chunks = splitIntoChunks(text, 220).slice(0, 8); // safety limit
    if (chunks.length === 0) chunks.push(text.slice(0, 220));
    const encoder = new TextEncoder();
    let aborted = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            if (aborted) break;
            const part = chunks[i];
            try {
              const speech: any = await client.audio.speech.create({ model, voice, input: part, format: 'mp3' } as any);
              const arrayBuffer = await speech.arrayBuffer();
              const b64 = Buffer.from(arrayBuffer).toString('base64');
              const payload = { index: i, total: chunks.length, b64, part };
              controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'));
            } catch (err) {
              controller.enqueue(encoder.encode(JSON.stringify({ error: 'chunk_failed', index: i }) + '\n'));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
      cancel() { aborted = true; }
    });
    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    console.error('stream tts error', e);
    return NextResponse.json({ error: 'Stream TTS failed' }, { status: 500 });
  }
}
