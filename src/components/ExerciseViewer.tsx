"use client";
import { useEffect, useMemo, useState } from 'react';
import PdfRunner from '@/components/PdfRunner';

type Page = { pageNumber: number; imagePath: string };

export default function ExerciseViewer({
  pdfId,
  title,
  level,
  topic,
  mainSrc,
  pages,
}: {
  pdfId: number;
  title: string;
  level: string;
  topic: string;
  mainSrc: string;
  pages: Page[];
}) {
  const allPages = useMemo<Page[]>(() => [{ pageNumber: 1, imagePath: mainSrc }, ...((pages || []) as Page[])], [mainSrc, pages]);
  const [idx, setIdx] = useState(0);
  const current = allPages[Math.max(0, Math.min(idx, allPages.length - 1))];

  const canPrev = idx > 0;
  const canNext = idx < allPages.length - 1;

  // Keyboard navigation ←/→
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && idx > 0) setIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight' && idx < allPages.length - 1) setIdx(i => Math.min(allPages.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, allPages.length]);

  // Preload next image for smoother navigation
  useEffect(() => {
    const next = allPages[idx + 1];
    if (next?.imagePath) {
      const img = new Image();
      img.src = next.imagePath;
    }
  }, [idx, allPages]);

  return (
  <div className="space-y-3" data-pdfid={pdfId} data-pageimg={current.imagePath}>
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          className={`px-2 py-1 rounded border ${canPrev ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => canPrev && setIdx((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
        >
          ◀ Précédent
        </button>
        <div className="flex items-center gap-1">
          {allPages.map((p, i) => (
            <button
              key={p.pageNumber}
              type="button"
              onClick={() => setIdx(i)}
              className={`w-8 px-2 py-1 rounded border text-xs ${i === idx ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
            >
              {p.pageNumber}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`px-2 py-1 rounded border ${canNext ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => canNext && setIdx((i) => Math.min(allPages.length - 1, i + 1))}
          disabled={!canNext}
        >
          Suivant ▶
        </button>
      </div>

      <div className="w-full bg-white border rounded overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.imagePath} loading="lazy" alt={`${title} - page ${current.pageNumber}`} className="max-w-full h-auto" />
      </div>

      <PdfRunner pdfId={pdfId} title={title} level={level} topic={topic} selectedImagePath={current.imagePath} />
    </div>
  );
}
