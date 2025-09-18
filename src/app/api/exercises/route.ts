import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level') as any;
  const topic = searchParams.get('topic') as any;
  const where: any = {};
  if (level) where.level = level;
  if (topic) where.topic = topic;
  const items = await prisma.exercise.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { title, description, level, topic, expected } = body;
  const ex = await prisma.exercise.create({ data: { title, description, level, topic, expected } });
  return NextResponse.json({ item: ex }, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, title, description, level, topic, expected } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ex = await prisma.exercise.update({ where: { id: Number(id) }, data: { title, description, level, topic, expected } });
  return NextResponse.json({ item: ex });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.exercise.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
