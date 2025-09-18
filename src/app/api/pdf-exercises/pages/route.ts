import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    const pages = await prisma.$queryRaw`SELECT "pageNumber", "imagePath" FROM "PdfPageImage" WHERE "pdfExerciseId" = ${id} ORDER BY "pageNumber" ASC` as Array<{ pageNumber: number; imagePath: string }>;
    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ pages: [] });
  }
}
