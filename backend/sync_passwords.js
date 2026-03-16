const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:!zxasqw12@@34.64.78.99:5432/WAYN-Ai-db?schema=public'
    }
  }
});

async function main() {
  console.log('🔄 비밀번호 동기화 스크립트 시작 (Approval -> User.customClaims)');

  // 1. 모든 User를 조회하되, TenantId가 있는(가맹점에 속한) 유저만 조회
  const users = await prisma.user.findMany({
    where: { tenantId: { not: null } },
  });

  let updateCount = 0;

  for (const user of users) {
    // 2. 가맹점의 가장 최신 JOIN_REQUEST 승인 내역 조회
    const approval = await prisma.approval.findFirst({
      where: { tenantId: user.tenantId, type: 'JOIN_REQUEST' },
      orderBy: { requestedAt: 'desc' }
    });

    if (approval && approval.contentData) {
      const content = approval.contentData;
      if (content.password) {
        const correctPassword = content.password;
        const currentClaims = user.customClaims || {};

        if (currentClaims.password !== correctPassword) {
            console.log(`[수정] 유저 ${user.email} 의 비밀번호를 111111 등으로 교체합니다.`);
            // 3. customClaims.password 값 덮어쓰기
            await prisma.user.update({
              where: { id: user.id },
              data: {
                customClaims: {
                  ...currentClaims,
                  password: correctPassword
                }
              }
            });
            updateCount++;
        }
      }
    }
  }

  console.log(`✅ 동기화 완료: 총 ${updateCount}명의 유저 권한이 수정되었습니다.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
