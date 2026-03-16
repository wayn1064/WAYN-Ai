import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const approvals = await prisma.approval.findMany({
    where: { type: 'JOIN_REQUEST' },
    orderBy: { requestedAt: 'desc' },
    take: 1
  });
  console.log(JSON.stringify(approvals[0], null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
