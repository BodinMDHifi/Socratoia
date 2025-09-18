import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import TeacherPdfItemActions from '@/components/TeacherPdfItemActions';
import UploadSuccessBanner from '@/components/UploadSuccessBanner';

export const dynamic = 'force-dynamic';

export default async function TeacherPdfs() {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== 'TEACHER') {
    return <div>Accès réservé.</div>;
  }
  const items = await prisma.imageExercise.findMany({ orderBy: { createdAt: 'desc' } });
  // Load extra pages for each exercise to display quick thumbnails
  const withPages = [] as any[];
  for (const it of items as any[]) {
    let pages: Array<{ pageNumber: number; imagePath: string }> = [];
    try { pages = await prisma.$queryRaw`SELECT "pageNumber", "imagePath" FROM "PdfPageImage" WHERE "pdfExerciseId" = ${it.id} ORDER BY "pageNumber" ASC`; } catch {}
    withPages.push({ ...it, pages });
  }
  const uploaded = typeof (global as any).request !== 'undefined' ? false : false; // placeholder (SSR)
  return (
    <div className="space-y-6">
    <h1 className="text-2xl font-semibold">Exercices par image</h1>
  <UploadSuccessBanner />
  <form action="/api/pdf-exercises" method="post" encType="multipart/form-data" className="card p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-2">
          <input name="title" className="border rounded px-2 py-1" placeholder="Titre" required />
          <select name="level" className="border rounded px-2 py-1">
            <option value="SIXIEME">6e</option>
            <option value="CINQUIEME">5e</option>
            <option value="QUATRIEME">4e</option>
            <option value="TROISIEME">3e</option>
          </select>
          <select name="topic" className="border rounded px-2 py-1">
            <option value="MATTER">Matière</option>
            <option value="SIGNALS">Signaux</option>
            <option value="ENERGY">Énergie</option>
            <option value="MOTION">Mouvements</option>
          </select>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium">Page 1 (obligatoire)</label>
            <input name="file" type="file" accept="image/png,image/jpeg,image/webp" className="block" required />
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Page 2 (optionnel)</label>
              <input name="file2" type="file" accept="image/png,image/jpeg,image/webp" className="block" />
            </div>
            <div>
              <label className="text-sm">Page 3 (optionnel)</label>
              <input name="file3" type="file" accept="image/png,image/jpeg,image/webp" className="block" />
            </div>
          </div>
        </div>
        <button className="bg-school-600 text-white px-4 py-2 rounded">Uploader</button>
      </form>
      <div className="grid md:grid-cols-2 gap-4">
        {withPages.map((it:any) => (
          <div key={it.id} className="card p-4 space-y-2">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>{it.level} • {it.topic}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border">{1 + (it.pages?.length || 0)} pages</span>
            </div>
            <div className="font-medium">{it.title}</div>
            <div className="flex items-center gap-3">
              <img src={(it as any).imagePath} alt="Page 1" className="h-16 w-auto border rounded" />
              <a className="text-school-700 underline text-sm" href={(it as any).imagePath} target="_blank">Ouvrir la page 1</a>
            </div>
            {it.pages?.length ? (
              <div className="flex items-center gap-2 mt-2">
                {it.pages.map((p: any) => (
                  <div key={p.pageNumber} className="flex items-center gap-2">
                    <img src={p.imagePath} alt={`Page ${p.pageNumber}`} className="h-12 w-auto border rounded" />
                    <a className="text-school-700 underline text-xs" href={p.imagePath} target="_blank">Ouvrir P{p.pageNumber}</a>
                  </div>
                ))}
              </div>
            ) : null}
            <TeacherPdfItemActions id={it.id} title={it.title} />
          </div>
        ))}
      </div>
    </div>
  );
}
