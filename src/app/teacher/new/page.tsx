"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewExercisePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('SIXIEME');
  const [topic, setTopic] = useState('MATTER');
  const [expected, setExpected] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, level, topic, expected }) });
    if (res.ok) router.push('/teacher');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <h1 className="text-xl font-semibold">Nouvel exercice</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="w-full border px-3 py-2 rounded" placeholder="Consigne / description" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="flex gap-2">
          <select className="border px-2 py-1 rounded" value={level} onChange={e=>setLevel(e.target.value)}>
            <option value="SIXIEME">6e</option>
            <option value="CINQUIEME">5e</option>
            <option value="QUATRIEME">4e</option>
            <option value="TROISIEME">3e</option>
          </select>
          <select className="border px-2 py-1 rounded" value={topic} onChange={e=>setTopic(e.target.value)}>
            <option value="MATTER">Matière</option>
            <option value="SIGNALS">Signaux</option>
            <option value="ENERGY">Énergie</option>
            <option value="MOTION">Mouvements</option>
          </select>
        </div>
        <input className="w-full border px-3 py-2 rounded" placeholder="Mots clés attendus (optionnel)" value={expected} onChange={e=>setExpected(e.target.value)} />
        <button className="bg-school-600 text-white px-4 py-2 rounded">Créer</button>
      </form>
    </div>
  );
}
