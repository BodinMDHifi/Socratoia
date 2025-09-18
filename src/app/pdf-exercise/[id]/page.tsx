import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ExerciseViewer from '@/components/ExerciseViewer';

export const dynamic = 'force-dynamic';

export default async function PdfExerciseDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const item = await prisma.imageExercise.findUnique({ where: { id } });
  // Fetch extra pages via raw SQL to avoid client regen issues
  let pages: Array<{ pageNumber: number; imagePath: string }> = [];
  try {
    pages = await prisma.$queryRaw`SELECT "pageNumber", "imagePath" FROM "PdfPageImage" WHERE "pdfExerciseId" = ${id} ORDER BY "pageNumber" ASC`;
  } catch {}
  await getServerSession(authOptions);
  if (!item) return <div>Exercice image introuvable.</div>;
  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">{item.level} • {item.topic}</div>
      <h1 className="text-2xl font-semibold">{item.title}</h1>
  <ExerciseViewer pdfId={item.id} title={item.title} level={item.level} topic={item.topic} mainSrc={(item as any).imagePath} pages={pages} />
    </div>
  );
}

