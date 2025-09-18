import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiFeedback, ruleBasedFeedback } from '@/lib/feedback';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const current = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email! } }) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 415 });
  try {
    const form = await req.formData();
    const exerciseId = form.get('exerciseId') ? Number(form.get('exerciseId')) : null;
    const pdfExerciseId = form.get('pdfExerciseId') ? Number(form.get('pdfExerciseId')) : null;
    const pageImagePath = form.get('pageImagePath') ? String(form.get('pageImagePath')) : null;
    const audio = form.get('audio') as File | null;
    if ((!exerciseId && !pdfExerciseId) || !audio) return NextResponse.json({ error: 'Missing exercise id or audio' }, { status: 400 });

    // Transcribe audio
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcriptResp = await client.audio.transcriptions.create({
      file: audio as any,
      model: process.env.STT_MODEL || 'gpt-4o-mini-transcribe',
      language: 'fr',
    } as any);
    const answer = (transcriptResp as any).text || '';

    // Build context and history similar to /api/submissions
    const exercise = exerciseId ? await prisma.exercise.findUnique({ where: { id: exerciseId } }) : null;
    const imgEx = pdfExerciseId ? await prisma.imageExercise.findUnique({ where: { id: pdfExerciseId } }) : null;
    const HISTORY_EXCHANGES = Math.max(1, Math.min(50, Number(process.env.HISTORY_EXCHANGES) || 20));
    const prev = await prisma.submission.findMany({
      where: { userId: current.id, ...(exerciseId ? { exerciseId } : {}), ...(pdfExerciseId ? { imageExerciseId: pdfExerciseId } : {}) },
      orderBy: { createdAt: 'desc' }, take: HISTORY_EXCHANGES,
    });
    const prevChrono = prev.reverse();
    const history = prevChrono.flatMap((s: { answer: string; feedback: string }) => ([{ role: 'user', content: s.answer }, { role: 'assistant', content: s.feedback }]));
    let context: any = exercise ? exercise : undefined;
    if (!context && imgEx) {
      context = { title: imgEx.title, description: `Énoncé image: ${imgEx.imagePath}`, topic: imgEx.topic, expected: null };
    }
    // Build images list (include all pages)
    const imagesList: string[] = [];
    if (imgEx) {
      const pagePaths: string[] = [];
      if (imgEx.imagePath) pagePaths.push(imgEx.imagePath);
      try {
        const rows = await prisma.$queryRaw`SELECT "imagePath" FROM "PdfPageImage" WHERE "pdfExerciseId" = ${imgEx.id} ORDER BY "pageNumber" ASC` as Array<{ imagePath: string }>;
        for (const r of rows) { if (r?.imagePath) pagePaths.push(r.imagePath); }
      } catch {}
      if (pageImagePath && !pagePaths.includes(pageImagePath)) pagePaths.unshift(pageImagePath);
      const seen = new Set<string>();
      for (const rel of pagePaths) {
        if (!rel || seen.has(rel)) continue; seen.add(rel);
        try {
          const p = path.join(process.cwd(), 'public', rel.replace(/^\/+/, ''));
          const buf = await fs.readFile(p);
          const ext = (rel.split('.').pop() || '').toLowerCase();
          const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          imagesList.push(`data:${mime};base64,${buf.toString('base64')}`);
        } catch {
          try { imagesList.push(new URL(rel, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString()); } catch {}
        }
      }
    }
    const images = imagesList.length ? imagesList : undefined;

    // Get AI feedback text
    let feedback: string; let score: number | undefined;
    try { ({ feedback, score } = await aiFeedback(answer, context as any, history as any, images)); }
    catch (e) { ({ feedback, score } = ruleBasedFeedback(answer, context as any)); }

    // Persist submission with transcription
    const sub = await prisma.submission.create({ data: { userId: current.id, exerciseId: exerciseId || null, imageExerciseId: pdfExerciseId || null, answer, feedback, score } });
    await prisma.progress.upsert({
      where: { userId_level_topic: { userId: current.id, level: (exercise?.level || imgEx!.level), topic: (exercise?.topic || imgEx!.topic) } },
      update: { completed: { increment: 1 } },
      create: { userId: current.id, level: (exercise?.level || imgEx!.level), topic: (exercise?.topic || imgEx!.topic), completed: 1 },
    });

    // Generate TTS for feedback and save to /public/uploads/audio
    const uploadsAudio = path.join(process.cwd(), 'public', 'uploads', 'audio');
    try { await fs.mkdir(uploadsAudio, { recursive: true }); } catch {}
  const ttsModel = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
  let voice = process.env.TTS_VOICE || 'alloy';
  voice = String(voice).toLowerCase();
  const allowed = new Set(['alloy','verse','aria','luna','maya','sage']);
  if (!allowed.has(voice)) voice = 'alloy';
    let audioPath: string | null = null;
    try {
      const speech = await client.audio.speech.create({ model: ttsModel, voice, input: feedback, format: 'mp3' } as any);
      const arrayBuffer = await speech.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      const name = `tts-${Date.now()}-${Math.random().toString(36).slice(2,8)}.mp3`;
      await fs.writeFile(path.join(uploadsAudio, name), buf);
      audioPath = `/uploads/audio/${name}`;
      // Append index entry for cleanup when conversation is cleared
      try {
        const indexPath = path.join(uploadsAudio, 'index.json');
        let index: any[] = [];
        try {
          const raw = await fs.readFile(indexPath, 'utf-8');
          index = JSON.parse(raw);
          if (!Array.isArray(index)) index = [];
        } catch {}
        index.push({
          audioPath,
          userId: current.id,
          exerciseId,
          imageExerciseId: pdfExerciseId,
          submissionId: sub.id,
          createdAt: new Date().toISOString(),
        });
        await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
      } catch {}
  } catch {}
  return NextResponse.json({ item: sub, audioPath, transcript: answer, feedback }, { status: 201 });
  } catch (e: any) {
    console.error('voice submission failed', e);
    return NextResponse.json({ error: 'Voice submission failed' }, { status: 500 });
  }
}
