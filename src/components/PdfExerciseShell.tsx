"use client";
import PdfRunner from '@/components/PdfRunner';

export default function PdfExerciseShell({ pdfId, title, level, topic }: { pdfId: number; title: string; level: string; topic: string }) {
  return (
    <PdfRunner pdfId={pdfId} title={title} level={level} topic={topic} />
  );
}