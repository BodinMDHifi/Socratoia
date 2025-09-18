const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ensure admin teacher exists
  const bcrypt = require('bcryptjs');
  const adminEmail = 'admin'; // credential field accepts string id
  const adminPwd = 'admin';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPwd, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hash, name: 'Admin', role: 'TEACHER' } });
    console.log('Admin user created: admin / admin');
  } else if (existing.role !== 'TEACHER') {
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'TEACHER' } });
    console.log('Admin user updated to TEACHER role');
  }
  // Exemple: 4e — Vitesse moyenne
  const exercise = await prisma.exercise.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Calcul de la vitesse moyenne',
      description: 'Un cycliste parcourt 12 km en 40 minutes. Calcule sa vitesse moyenne en km/h et explique la démarche.',
      level: 'QUATRIEME',
      topic: 'MOTION',
      expected: 'vitesse distance temps unité km/h 12 40 minutes 18',
    }
  });
  console.log('Seed ok:', exercise.title);
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
