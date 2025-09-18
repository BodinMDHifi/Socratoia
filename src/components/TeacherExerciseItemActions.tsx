'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  id: number;
  title: string;
  description: string;
  level: string;
  topic: string;
  expected?: string | null;
};

export default function TeacherExerciseItemActions({ id, title, description, level, topic, expected }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleEdit() {
    const newTitle = prompt('Nouveau titre', title);
    if (newTitle == null) return;
    const newDesc = prompt('Nouvelle description', description ?? '') ?? description ?? '';
    setBusy(true);
    try {
      const res = await fetch('/api/exercises', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: newTitle, description: newDesc, level, topic, expected }),
      });
      if (!res.ok) throw new Error('PUT failed');
      router.refresh();
    } catch (e) {
      alert('Échec de la modification');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet exercice ?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/exercises?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE failed');
      router.refresh();
    } catch (e) {
      alert('Échec de la suppression');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleEdit} className="text-sm underline" disabled={busy}>Modifier</button>
      <button onClick={handleDelete} className="text-sm text-red-600 underline" disabled={busy}>Supprimer</button>
    </div>
  );
}
