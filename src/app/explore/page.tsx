import LevelTopicFilter from '@/components/LevelTopicFilter';
import ExerciseCard from '@/components/ExerciseCard';
import PdfCard from '@/components/PdfCard';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function ExplorePage({ searchParams }: { searchParams: { level?: string; topic?: string } }) {
  const where: any = {};
  if (searchParams?.level) where.level = searchParams.level;
  if (searchParams?.topic) where.topic = searchParams.topic;
  const [items, imagesRaw] = await Promise.all([
    prisma.exercise.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.imageExercise.findMany({ where, orderBy: { createdAt: 'desc' } as any }),
  ]);
  const images = [] as any[];
  for (const it of imagesRaw as any[]) {
    let count = 1; // main page
    try {
      const rows = await prisma.$queryRaw`SELECT COUNT(*) as c FROM "PdfPageImage" WHERE "pdfExerciseId" = ${it.id}` as Array<{ c: number }>;
      const extra = Number((rows?.[0] as any)?.c || 0);
      count = 1 + extra;
    } catch {}
    images.push({ ...it, pagesCount: count });
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Explorer les exercices</h1>
      {/* Filtre client autonome (met à jour l'URL) */}
      <div>
        <LevelTopicFilter />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((ex: any) => <ExerciseCard key={ex.id} ex={ex} />)}
      </div>
      {images.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Exercices image</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {images.map((p: any) => <PdfCard key={p.id} item={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
