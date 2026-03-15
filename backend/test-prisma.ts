import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:!zxasqw12@@localhost/WAYN-Ai-db?host=%2Ftmp%2Ffake_cloudsql",
    },
  },
});
async function main() {
  await prisma.$connect();
}
main().catch(console.error);
