"use client";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function NavBar() {
  const { data } = useSession();
  const user = data?.user as any;
  return (
    <nav className="flex items-center gap-5 text-sm font-medium">
      <Link className="hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded" href="/dashboard">Espace élève</Link>
      <Link className="hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded" href="/teacher">Espace enseignant</Link>
      {!user?.email ? (
        <>
          <Link
            className="rounded px-3 py-1.5 text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            href="/register"
          >
            Inscription
          </Link>
          <Link
            className="rounded border border-white/70 px-3 py-1.5 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            href="/login"
          >
            Connexion
          </Link>
        </>
      ) : (
        <button onClick={()=>signOut({ callbackUrl: '/' })} className="hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded underline">Déconnexion</button>
      )}
    </nav>
  );
}
