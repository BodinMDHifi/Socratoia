import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="font-display text-4xl">Bienvenue sur PhysChim</h1>
      <p className="text-lg max-w-2xl">
        Entraîne-toi en Physique-Chimie par niveaux (6e, 5e, 4e, 3e) et par thèmes: matière, signaux, énergie, mouvements.
        Obtiens un retour instantané, pratique en mode vocal, et gagne des badges !
      </p>
      <div className="flex gap-4">
        <Link href="/register" className="bg-accent text-white px-4 py-2 rounded">Créer un compte</Link>
        <Link href="/login" className="border border-school-600 text-school-700 px-4 py-2 rounded">Se connecter</Link>
      </div>
    </section>
  );
}
