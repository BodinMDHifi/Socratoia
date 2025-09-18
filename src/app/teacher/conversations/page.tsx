import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function TeacherConversations({ searchParams }: { searchParams: { exerciseId?: string; userId?: string } }) {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== 'TEACHER') {
    return <div>Accès réservé.</div>;
  }

  const [exercises, students] = await Promise.all([
    prisma.exercise.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true } }),
    prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, email: true } })
  ]);

  const exerciseId = Number(searchParams.exerciseId) || exercises[0]?.id;
  const userId = Number(searchParams.userId) || undefined;

  const where: any = { exerciseId };
  if (userId) where.userId = userId;
  const subs = exerciseId ? await prisma.submission.findMany({ where, orderBy: { createdAt: 'asc' }, include: { user: true } }) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Conversations élèves</h1>
      <form className="flex gap-3">
        <label className="text-sm">Exercice
          <select name="exerciseId" defaultValue={exerciseId} className="ml-2 border rounded p-1">
            {exercises.map((e: { id:number; title:string }) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </label>
        <label className="text-sm">Élève
          <select name="userId" defaultValue={userId} className="ml-2 border rounded p-1">
            <option value="">Tous</option>
            {students.map((s: { id:number; name:string|null; email:string }) => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
          </select>
        </label>
        <button className="px-3 py-1 rounded bg-school-600 text-white">Afficher</button>
      </form>
      <div className="space-y-4">
        {subs.length === 0 && <div className="text-sm text-gray-500">Aucune conversation pour ce filtre.</div>}
        {subs.length > 0 && (
          <div className="bg-white rounded border p-4">
            {subs.map((m: any) => (
              <div key={m.id} className="space-y-1 py-2 border-b last:border-none">
                <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()} — {m.user.name || m.user.email}</div>
                <div><span className="font-medium">Élève:</span> {m.answer}</div>
                <div><span className="font-medium">Prof IA:</span> {m.feedback} {typeof m.score === 'number' ? `(score: ${m.score}/100)` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
