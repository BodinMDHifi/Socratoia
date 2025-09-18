import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { imageSize } from 'image-size';

export const runtime = 'nodejs';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9_.-]+/g, '-');
}

export async function GET() {
  const items = await prisma.imageExercise.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    if (role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const form = await req.formData();
    const title = String(form.get('title') || '').trim();
    const level = String(form.get('level') || '').trim();
    const topic = String(form.get('topic') || '').trim();
    const file1 = (form.get('file') as File | null) || null;
    const file2 = (form.get('file2') as File | null) || null;
    const file3 = (form.get('file3') as File | null) || null;
    if (!title || !level || !topic || !file1 || file1.size === 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const mime1 = (file1.type || '').toLowerCase();
    if (!mime1.startsWith('image/')) {
      return NextResponse.json({ error: 'Seules les images sont acceptées (png, jpeg, webp...)' }, { status: 400 });
    }
    const extras: File[] = [file2, file3].filter((f: any) => f && f.size > 0) as File[];
    for (const f of extras) {
      const mime = (f.type || '').toLowerCase();
      if (!mime.startsWith('image/')) {
        return NextResponse.json({ error: 'Seules les images sont acceptées (png, jpeg, webp...)' }, { status: 400 });
      }
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try { await fs.mkdir(uploadsDir, { recursive: true }); } catch {}
    // Save first image as main image
  const first = file1!;
  const orig1 = sanitizeFileName(first.name || 'exercice-image');
    const unique1 = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${orig1}`;
    const dest1 = path.join(uploadsDir, unique1);
    const buf1 = Buffer.from(await first.arrayBuffer());
    await fs.writeFile(dest1, buf1);
    const publicPath1 = `/uploads/${unique1}`;
    const item = await prisma.imageExercise.create({ data: { title, level, topic, imagePath: publicPath1, originalName: first.name || orig1 } });
    // Save additional pages if provided
    const pagesSaved: any[] = [];
  let pageNumber = 2;
    for (const f of extras) {
      try {
        const orig = sanitizeFileName((f as File).name || `page-${pageNumber}`);
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${orig}`;
        const dest = path.join(uploadsDir, unique);
        const buf = Buffer.from(await (f as File).arrayBuffer());
        await fs.writeFile(dest, buf);
        const publicPath = `/uploads/${unique}`;
        // Determine width/height to satisfy NOT NULL
        let width = 0, height = 0;
        try {
          const dim = imageSize(buf as any);
          if (dim.width && dim.height) { width = dim.width; height = dim.height; }
        } catch {}
        await prisma.$executeRaw`INSERT INTO "PdfPageImage" ("pdfExerciseId", "pageNumber", "imagePath", "width", "height") VALUES (${item.id}, ${pageNumber}, ${publicPath}, ${width}, ${height})`;
        pagesSaved.push({ imageExerciseId: item.id, pageNumber, imagePath: publicPath });
      } catch (e) {
        console.error('Failed to save extra page', e);
      } finally {
        pageNumber++;
      }
    }
    const accept = req.headers.get('accept') || '';
    if (accept.includes('text/html') || (req.headers.get('content-type') || '').includes('multipart/form-data')) {
      const url = new URL('/teacher/pdfs?uploaded=1', req.url);
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ item: { ...item, pages: pagesSaved } }, { status: 201 });
  } catch (e) {
    console.error('Upload failed', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  if (role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const item = await prisma.imageExercise.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Try to delete file
  try {
    const p = item.imagePath.replace(/^\/+/, '');
    await fs.unlink(path.join(process.cwd(), 'public', p));
  } catch {}
  // Load and delete page image files
  let pages: Array<{ imagePath: string }> = [];
  try {
    pages = await prisma.$queryRaw`SELECT "imagePath" FROM "PdfPageImage" WHERE "pdfExerciseId" = ${id}`;
  } catch {}
  for (const pg of pages) {
    try {
      const p = String(pg.imagePath || '').replace(/^\/+/, '');
      if (p) await fs.unlink(path.join(process.cwd(), 'public', p));
    } catch {}
  }
  // Delete rows from PdfPageImage
  try { await prisma.$executeRaw`DELETE FROM "PdfPageImage" WHERE "pdfExerciseId" = ${id}`; } catch {}
  await prisma.imageExercise.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  // Update PDF exercise metadata (title, level, topic)
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  if (role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let data: any;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const id = Number(data?.id);
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const updates: Record<string, any> = {};
  if (typeof data.title === 'string') updates.title = data.title.trim();
  if (typeof data.level === 'string') updates.level = data.level.trim();
  if (typeof data.topic === 'string') updates.topic = data.topic.trim();
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }
  try {
    const item = await prisma.imageExercise.update({ where: { id }, data: updates });
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}
