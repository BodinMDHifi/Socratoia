import './globals.css';
import 'katex/dist/katex.min.css';
import React from 'react';
import Link from 'next/link';
import Providers from '@/components/Providers';
import NavBar from '@/components/NavBar';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'PhysChim',
  description: "Exercices de Physique-Chimie pour le collège",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen text-board">
        <Providers>
  <header className="site-header text-white bg-gradient-to-r from-school-600 via-school-500 to-school-400 shadow-sm">
          <div className="container py-4 flex items-center justify-between gap-6">
            <Link href="/" className="font-display text-2xl">PhysChim</Link>
            <div className="flex items-center gap-3">
              <NavBar />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container py-10 space-y-10">
          {children}
        </main>
        <footer className="container py-8 text-sm text-gray-600">
          © {new Date().getFullYear()} PhysChim — Projet éducatif.
        </footer>
        </Providers>
      </body>
    </html>
  );
}
