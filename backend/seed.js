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
    UPDATE "Tenant"
    SET "businessRegistrationNumber" = '111-11-1111'
    WHERE name = '테스트병원'
  `;
  console.log('Updated tenants:', result);
  
  const userUpdateResult = await prisma.$executeRaw`
    UPDATE "User"
    SET "customClaims" = jsonb_set("customClaims"::jsonb, '{hospitalCode}', '"111-11-1111"')
    WHERE email = '12345@wayn.co.kr'
  `;
  console.log('Updated users:', userUpdateResult);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
