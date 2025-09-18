"use client";
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(()=> {
    setMounted(true);
    const pref = typeof window !== 'undefined' ? localStorage.getItem('pc-theme') : null;
    const initial = pref ? pref === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pc-theme', next ? 'dark' : 'light');
    }
    document.documentElement.classList.toggle('dark', next);
  };

  if (!mounted) return null;

  return (
    <button onClick={toggle} aria-label="Basculer thème" className="btn-outline h-9 px-3 text-xs">
      {dark ? 'Mode Clair' : 'Mode Sombre'}
    </button>
  );
}
