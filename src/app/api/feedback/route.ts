import { NextResponse } from 'next/server';
import { aiFeedback } from '@/lib/feedback';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const { answer, exercise } = await req.json();
  // Build optional history if session present and exercise id given
  let history: any[] | undefined = undefined;
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email! } }) : null;
    if (user && exercise?.id) {
  const HISTORY_EXCHANGES = Math.max(1, Math.min(50, Number(process.env.HISTORY_EXCHANGES) || 20));
  const prev = await prisma.submission.findMany({ where: { userId: user.id, exerciseId: exercise.id }, orderBy: { createdAt: 'asc' }, take: HISTORY_EXCHANGES });
      history = prev.flatMap((s: { answer: string; feedback: string }) => ([
        { role: 'user', content: s.answer },
        { role: 'assistant', content: s.feedback },
      ]));
    }
  } catch {}
  const res = await aiFeedback(answer, exercise, history as any);
  return NextResponse.json(res);
}
