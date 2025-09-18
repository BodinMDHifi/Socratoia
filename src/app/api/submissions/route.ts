import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { aiFeedback, ruleBasedFeedback } from '@/lib/feedback';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const current = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email! } }) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const exerciseId = Number(searchParams.get('exerciseId'));
  const pdfExerciseId = Number(searchParams.get('pdfExerciseId'));
  if (!exerciseId && !pdfExerciseId) return NextResponse.json({ error: 'Missing exerciseId or pdfExerciseId' }, { status: 400 });
  const subs = await prisma.submission.findMany({
    where: { userId: current.id, ...(exerciseId ? { exerciseId } : {}), ...(pdfExerciseId ? { imageExerciseId: pdfExerciseId } : {}) },
    orderBy: { createdAt: 'asc' },
    select: { id: true, answer: true, imagePath: true, feedback: true, score: true, createdAt: true },
  });
  return NextResponse.json({ items: subs }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const current = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email! } }) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Accept JSON or multipart/form-data for image submissions
  const contentType = req.headers.get('content-type') || '';
  let exerciseId: number | null = null;
  let pdfExerciseId: number | null = null;
  let answer = '';
  let pageImagePath: string | null = null;
  let imagePath: string | null = null;
  let imageDataUrl: string | null = null;
  if (contentType.includes('application/json')) {
  const body = await req.json();
  exerciseId = body.exerciseId ?? null;
  pdfExerciseId = body.pdfExerciseId ?? null; // kept for backwards-compat; mapped to imageExerciseId
    answer = body.answer ?? '';
  pageImagePath = body.pageImagePath ?? null;
  } else if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
  exerciseId = form.get('exerciseId') ? Number(form.get('exerciseId')) : null;
  pdfExerciseId = form.get('pdfExerciseId') ? Number(form.get('pdfExerciseId')) : null;
    answer = String(form.get('answer') || '');
  pageImagePath = form.get('pageImagePath') ? String(form.get('pageImagePath')) : null;
  const file = form.get('image') as File | null;
    if (file && file.size > 0) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
  const mime = (file.type || '').toLowerCase();
  const ext = mime.includes('png') ? '.png' : (mime.includes('jpeg') || mime.includes('jpg')) ? '.jpg' : mime.includes('webp') ? '.webp' : '.bin';
        const name = `sub-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
        const dest = path.join(uploadsDir, name);
        const buf = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(dest, buf);
        imagePath = `/uploads/${name}`;
    // Prepare base64 data URL for AI models that can't fetch localhost URLs
  const usedMime = file.type || 'image/jpeg';
  imageDataUrl = `data:${usedMime};base64,${buf.toString('base64')}`;
      } catch {}
    }
  } else {
    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
  }
  if ((!exerciseId && !pdfExerciseId) || (!answer && !imagePath)) return NextResponse.json({ error: 'Missing' }, { status: 400 });
  const exercise = exerciseId ? await prisma.exercise.findUnique({ where: { id: exerciseId } }) : null;
  const imgEx = pdfExerciseId ? await prisma.imageExercise.findUnique({ where: { id: pdfExerciseId } }) : null;
  // Build short history as alternating user/assistant messages
  const HISTORY_EXCHANGES = Math.max(1, Math.min(50, Number(process.env.HISTORY_EXCHANGES) || 20));
  const prev = await prisma.submission.findMany({
    where: { userId: current.id, ...(exerciseId ? { exerciseId } : {}), ...(pdfExerciseId ? { imageExerciseId: pdfExerciseId } : {}) },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_EXCHANGES,
  });
  // Keep chronological order for the model
  const prevChrono = prev.reverse();
  const history = prevChrono.flatMap((s: { answer: string; feedback: string }) => ([
    { role: 'user', content: s.answer },
    { role: 'assistant', content: s.feedback },
  ]));
  let context: any = exercise ? exercise : undefined;
  if (!context && imgEx) {
    context = { title: imgEx.title, description: `Énoncé image: ${imgEx.imagePath}`, topic: imgEx.topic, expected: null };
  }
  // Prefer data URLs for AI ingestion; include the exercise images (all pages) so the AI can see them.
  const imagesList: string[] = [];
  if (imageDataUrl) {
    imagesList.push(imageDataUrl);
  } else if (imagePath) {
    imagesList.push(new URL(imagePath, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString());
  }
  // Collect all exercise pages: main image + additional pages
  if (imgEx) {
    const pagePaths: string[] = [];
    // Main image first
    if (imgEx.imagePath) pagePaths.push(imgEx.imagePath);
    // Extra pages from PdfPageImage
    try {
      const rows = await prisma.$queryRaw`SELECT "imagePath" FROM "PdfPageImage" WHERE "pdfExerciseId" = ${imgEx.id} ORDER BY "pageNumber" ASC` as Array<{ imagePath: string }>;
      for (const r of rows) { if (r?.imagePath) pagePaths.push(r.imagePath); }
    } catch {}
    // If a specific page was selected, ensure it's included (avoid duplicates)
    if (pageImagePath && !pagePaths.includes(pageImagePath)) pagePaths.unshift(pageImagePath);
    // Convert to data URLs
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
  let feedback: string; let score: number | undefined;
  try {
    ({ feedback, score } = await aiFeedback(answer, context as any, history as any, images));
  } catch (e) {
    console.error('aiFeedback error', e);
    ({ feedback, score } = ruleBasedFeedback(answer, context as any));
  }
  const sub = await prisma.submission.create({ data: { userId: current.id, exerciseId: exerciseId || null, imageExerciseId: pdfExerciseId || null, answer, imagePath, feedback, score } });
  await prisma.progress.upsert({
    where: { userId_level_topic: { userId: current.id, level: (exercise?.level || imgEx!.level), topic: (exercise?.topic || imgEx!.topic) } },
    update: { completed: { increment: 1 } },
    create: { userId: current.id, level: (exercise?.level || imgEx!.level), topic: (exercise?.topic || imgEx!.topic), completed: 1 },
  });
  // Récompense: premier badge au premier envoi
  const count = await prisma.submission.count({ where: { userId: current.id } });
  if (count === 1) {
    const badge = await prisma.badge.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Premier pas', description: 'Ta première réponse envoyée', icon: '🎉' },
    });
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: current.id, badgeId: badge.id } },
      update: {},
      create: { userId: current.id, badgeId: badge.id },
    });
  }
  return NextResponse.json({ item: sub }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const current = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email! } }) : null;
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const exerciseId = Number(searchParams.get('exerciseId'));
  const pdfExerciseId = Number(searchParams.get('pdfExerciseId'));
  if (!exerciseId && !pdfExerciseId) return NextResponse.json({ error: 'Missing exerciseId or pdfExerciseId' }, { status: 400 });
  // Load submissions to get stored artifact paths before deletion
  const subs = await prisma.submission.findMany({
    where: { userId: current.id, ...(exerciseId ? { exerciseId } : {}), ...(pdfExerciseId ? { imageExerciseId: pdfExerciseId } : {}) },
    select: { id: true, imagePath: true },
  });
  // Delete DB rows
  const result = await prisma.submission.deleteMany({ where: { userId: current.id, ...(exerciseId ? { exerciseId } : {}), ...(pdfExerciseId ? { imageExerciseId: pdfExerciseId } : {}) } });
  // Best-effort: remove uploaded student images
  try {
    for (const s of subs) {
      if (!s.imagePath) continue;
      try {
        const p = path.join(process.cwd(), 'public', s.imagePath.replace(/^\/+/, ''));
        await fs.unlink(p);
      } catch {}
    }
  } catch {}
  // Best-effort: remove generated TTS audio tied to these submissions using index file
  try {
    const uploadsAudio = path.join(process.cwd(), 'public', 'uploads', 'audio');
    const indexPath = path.join(uploadsAudio, 'index.json');
    let index: Array<{ audioPath: string; submissionId?: number; userId?: number; exerciseId?: number | null; imageExerciseId?: number | null }>; index = [];
    try {
      const raw = await fs.readFile(indexPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) index = parsed as any;
    } catch {}
    if (index.length) {
      const toDeleteIds = new Set(subs.map(s => s.id));
      const keep: typeof index = [];
      for (const it of index) {
        const matchBySubmission = it.submissionId && toDeleteIds.has(it.submissionId);
        const matchByScope = it.userId === current.id && ((exerciseId && it.exerciseId === exerciseId) || (pdfExerciseId && it.imageExerciseId === pdfExerciseId));
        if (matchBySubmission || matchByScope) {
          if (it.audioPath) {
            try {
              const rel = it.audioPath.replace(/^\/+/, '');
              await fs.unlink(path.join(process.cwd(), 'public', rel));
            } catch {}
          }
        } else {
          keep.push(it);
        }
      }
      try { await fs.writeFile(indexPath, JSON.stringify(keep, null, 2), 'utf-8'); } catch {}
    }
  } catch {}
  return NextResponse.json({ deleted: result.count });
}
