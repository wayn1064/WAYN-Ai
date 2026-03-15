import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:!zxasqw12@@%2Ftmp%2Ffake_cloudsql/WAYN-Ai-db",
    },
  },
});
async function main() {
  await prisma.$connect();
}
main().catch(console.error);
