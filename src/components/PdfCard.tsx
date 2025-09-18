import React from 'react';
import Link from 'next/link';

export default function PdfCard({ item }: { item: { id: number; title: string; level: string; topic: string; imagePath: string; pagesCount?: number } }) {
  return (
  <div className="card p-5 flex flex-col gap-3 group">
      <div className="flex items-center gap-2 text-[11px] font-medium text-school-700">
        <span className="badge-soft bg-white">{item.level}</span>
        <span className="badge-soft bg-white">{item.topic}</span>
        {typeof item.pagesCount === 'number' && (
          <span className="ml-auto badge-soft bg-white">{item.pagesCount} pages</span>
        )}
      </div>
      <h3 className="text-lg font-semibold leading-snug group-hover:text-school-700 transition-colors">{item.title}</h3>
      <div className="flex gap-2 mt-auto flex-wrap">
        <a className="btn-outline" href={item.imagePath} target="_blank" rel="noreferrer">Voir l'image</a>
        <Link className="btn-primary" href={`/pdf-exercise/${item.id}`}>Travailler</Link>
      </div>
    </div>
  );
}
