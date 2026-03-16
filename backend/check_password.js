const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:!zxasqw12@@34.64.78.99:5432/WAYN-Ai-db?schema=public'
    }
  }
});

async function main() {
  const users = await prisma.$queryRaw`SELECT id, email, name, "tenantId", "customClaims" FROM "User" WHERE email='12345@wayn.co.kr'`;
  console.dir(users, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
