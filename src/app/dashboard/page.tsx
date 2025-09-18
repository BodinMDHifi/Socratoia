import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import ProgressWidget from '@/components/ProgressWidget';
import RewardsWidget from '@/components/RewardsWidget';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import StatCard from '@/components/StatCard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div>
        <p>Veuillez vous connecter.</p>
        <Link className="text-school-700 underline" href="/login">Aller à la connexion</Link>
      </div>
    );
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const progresses = await prisma.progress.findMany({ where: { userId: user!.id } });
  const userBadges = await prisma.userBadge.findMany({ where: { userId: user!.id }, include: { badge: true } });

  // Derived stats (simple examples)
  const sessionsCompleted = progresses.reduce((a: number, p: any)=> a + (p.completed || 0), 0);
  const avgScoreRow = await prisma.submission.aggregate({ where: { userId: user!.id, score: { not: null } }, _avg: { score: true } });
  const avgScore = Math.round(avgScoreRow._avg.score || 0);
  const totalExercises = await prisma.exercise.count();
  const studyMinutes = 0; // Placeholder; implement time tracking later.

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold leading-tight">Tableau de Bord</h1>
        <p className="text-sm text-gray-600">Suivez vos progrès et continuez votre apprentissage</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Annales Disponibles" value={totalExercises} accent="blue" helper="Exercices standard" />
        <StatCard label="Sessions Complétées" value={sessionsCompleted} accent="green" helper="Total questions validées" />
        <StatCard label="Score Moyen" value={`${avgScore || 0}%`} accent="purple" helper="Basé sur vos réponses" />
        <StatCard label="Temps d'étude" value={`${studyMinutes}min`} accent="amber" helper="Tracking bientôt" />
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <section className="space-y-4">
            <h2 className="section-title text-xl font-semibold">Annales Récentes</h2>
            <div className="card p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-school-50/60 rounded-lg p-3">
                  <div>
                    <div className="font-medium">DNB - Asie Pacifique - 2025</div>
                    <div className="text-xs text-gray-600">2025</div>
                  </div>
                  <span className="badge-soft">physique-chimie</span>
                </div>
                <div>
                  <Link href="/explore" className="btn-outline">Voir Toutes les Annales</Link>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="section-title text-xl font-semibold">Sessions Récentes</h2>
            <div className="card p-4 space-y-3">
              {[1,2,3].map(i=> (
                <div key={i} className="flex items-center justify-between rounded-lg p-3 bg-gradient-to-r from-school-50 to-white border border-school-100/60">
                  <div>
                    <div className="text-sm font-medium">DNB - Asie Pacifique - 2025</div>
                    <div className="text-[11px] text-gray-600">0 minutes</div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-600">0%</span>
                </div>
              ))}
              <div>
                <Link href="/explore" className="btn-outline w-full justify-center">Voir Tous les Progrès</Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <ProgressWidget items={progresses.map((p: any)=>({ level: p.level as string, topic: p.topic as string, completed: p.completed as number }))} />
        <RewardsWidget badges={userBadges.map((ub: any)=>({ name: ub.badge.name as string, description: ub.badge.description as string, icon: ub.badge.icon as string }))} />
      </div>

      <div>
        <Link href="/explore" className="btn-primary">Nouvelle Session</Link>
      </div>
    </div>
  );
}
