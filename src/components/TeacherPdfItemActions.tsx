'use client';

import React, { useState } from 'react';

type Props = {
  id: number;
  title: string;
  onChanged?: () => void;
};

export default function TeacherPdfItemActions({ id, title, onChanged }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleEdit() {
    const n = prompt('Nouveau titre', title);
    if (n == null) return;
    setBusy(true);
    try {
      const res = await fetch('/api/pdf-exercises', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: n }),
      });
      if (!res.ok) throw new Error('PUT failed');
      onChanged ? onChanged() : location.reload();
    } catch (e) {
      alert('Échec de la modification');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce PDF ?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/pdf-exercises?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE failed');
      onChanged ? onChanged() : location.reload();
    } catch (e) {
      alert('Échec de la suppression');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button className="text-sm underline" onClick={handleEdit} disabled={busy}>Modifier</button>
      <button className="text-sm text-red-600 underline" onClick={handleDelete} disabled={busy}>Supprimer</button>
    </div>
  );
}
