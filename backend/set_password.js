const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:!zxasqw12@@34.64.78.99:5432/WAYN-Ai-db?schema=public'
    }
  }
});

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE "User"
    SET "customClaims" = jsonb_set("customClaims"::jsonb, '{password}', '"123456"')
    WHERE email = '12345@wayn.co.kr'
  `;
  console.log('Updated user password in claims:', result);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
