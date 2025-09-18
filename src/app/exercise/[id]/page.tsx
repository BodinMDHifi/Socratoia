import { prisma } from '@/lib/prisma';
import ExerciseRunner from '@/components/ExerciseRunner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MathText from '@/components/MathText';

export const dynamic = 'force-dynamic';

export default async function ExerciseDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const ex = await prisma.exercise.findUnique({ where: { id } });
  await getServerSession(authOptions);

  if (!ex) return <div>Exercice introuvable.</div>;
  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">{ex.level} • {ex.topic}</div>
      <h1 className="text-2xl font-semibold">{ex.title}</h1>
      <div className="prose max-w-none text-gray-800">
        <MathText text={ex.description} />
      </div>
  <ExerciseRunner exerciseId={id} />
    </div>
  );
}
