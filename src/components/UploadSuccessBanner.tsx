'use client';
import { useEffect, useState } from 'react';

export default function UploadSuccessBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('uploaded') === '1') {
      setShow(true);
      const t = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);
  if (!show) return null;
  return (
    <div className="rounded border border-green-300 bg-green-50 text-green-800 px-3 py-2">Images uploadées avec succès.</div>
  );
}
