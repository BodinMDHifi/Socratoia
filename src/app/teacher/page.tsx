import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import TeacherExerciseItemActions from '@/components/TeacherExerciseItemActions';

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== 'TEACHER') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Espace enseignant</h1>
        <p>Accès réservé. Demandez au professeur d'activer votre rôle.</p>
      </div>
    );
  }
  const items = await prisma.exercise.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Espace enseignant</h1>
        <div className="flex gap-2">
          <Link href="/teacher/pdfs" className="border border-school-600 text-school-700 px-4 py-2 rounded">Exercices PDF</Link>
          <Link href="/teacher/new" className="bg-school-600 text-white px-4 py-2 rounded">Nouvel exercice</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((ex: any) => (
          <div key={ex.id} className="card p-4 space-y-2">
            <div className="text-xs text-gray-500">{ex.level} • {ex.topic}</div>
            <h3 className="text-lg font-semibold">{ex.title}</h3>
            <TeacherExerciseItemActions id={ex.id} title={ex.title} description={ex.description} level={ex.level} topic={ex.topic} expected={ex.expected} />
          </div>
        ))}
      </div>
    </div>
  );
}
