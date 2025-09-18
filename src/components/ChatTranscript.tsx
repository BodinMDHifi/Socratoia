"use client";
import MathText from '@/components/MathText';

type Item = {
  id: number;
  answer: string;
  imagePath?: string | null;
  feedback: string;
  score?: number | null;
  createdAt: string | Date;
};

export default function ChatTranscript({ items }: { items: Item[] }) {
  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div key={m.id} className="space-y-2">
          {/* Student bubble */}
          <div className="flex">
            <div className="ml-auto max-w-[80%] rounded-2xl px-3 py-2 bg-blue-50 border border-blue-100 shadow-sm">
              <div className="text-xs text-gray-500 text-right">Élève · {formatTime(m.createdAt)}</div>
              {m.answer && <div className="whitespace-pre-wrap text-gray-900">{m.answer}</div>}
              {m.imagePath && (
                <div className="mt-2">
                  <img src={m.imagePath} alt="Image fournie par l'élève" className="max-h-64 rounded border" />
                </div>
              )}
            </div>
          </div>
          {/* AI bubble */}
          <div className="flex">
            <div className="mr-auto max-w-[80%] rounded-2xl px-3 py-2 bg-white border shadow-sm">
              <div className="text-xs text-gray-500">Prof IA {typeof m.score === 'number' ? `(score: ${m.score}/100)` : ''} · {formatTime(m.createdAt)}</div>
              <div className="mt-1"><MathText text={m.feedback} /></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
