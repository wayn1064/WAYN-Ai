import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:!zxasqw12@@invalidhost/WAYN-Ai-db?socket=/tmp/fake_cloudsql",
    },
  },
});
async function main() {
  await prisma.$connect();
}
main().catch(console.error);
