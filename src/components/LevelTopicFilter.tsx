"use client";
import { useRouter, useSearchParams } from 'next/navigation';

const levels = [
  { value: '', label: 'Tous niveaux' },
  { value: 'SIXIEME', label: '6e' },
  { value: 'CINQUIEME', label: '5e' },
  { value: 'QUATRIEME', label: '4e' },
  { value: 'TROISIEME', label: '3e' },
];
const topics = [
  { value: '', label: 'Tous thèmes' },
  { value: 'MATTER', label: 'Matière' },
  { value: 'SIGNALS', label: 'Signaux' },
  { value: 'ENERGY', label: 'Énergie' },
  { value: 'MOTION', label: 'Mouvements' },
];

export default function LevelTopicFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const level = sp.get('level') ?? '';
  const topic = sp.get('topic') ?? '';

  const update = (k: 'level'|'topic', v: string) => {
    const params = new URLSearchParams(sp as any);
    if (v) params.set(k, v); else params.delete(k);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 items-center">
      <select value={level} onChange={e=>update('level', e.target.value)} className="border px-2 py-1 rounded">
        {levels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
      <select value={topic} onChange={e=>update('topic', e.target.value)} className="border px-2 py-1 rounded">
        {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
    </div>
  );
}
