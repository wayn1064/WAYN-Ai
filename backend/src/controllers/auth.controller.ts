import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalCode, email, password } = req.body;

    if (!hospitalCode || !email || !password) {
      res.status(400).json({ error: '회원병원 ID, 이메일, 비밀번호는 필수입니다.' });
      return;
    }

    // Tenant를 병원 코드로 확인 - 승인될 때 이름이 hospitalCode 로 바뀜 // 혹은 User의 claims에 기록?
    // User claims에서 가지고 있는지 확인하는게 정확함.
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user || !user.tenant) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }
    
    const customClaims = user.customClaims as any || {};

    // 승인될 때 관리자가 hospitalCode를 User 클래임 혹은 Tenant name에 적음.
    // 여기서는 tenant.name 과 매칭하거나 customClaims.hospitalCode 와 매칭
    if (user.tenant.name !== hospitalCode && customClaims.hospitalCode !== hospitalCode) {
        res.status(401).json({ error: '회원병원 ID가 올바르지 않습니다.' });
        return;
    }

    // 비밀번호 확인
    if (customClaims.password !== password) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    // 승인 대기 상태 확인
    if (!user.tenant.isActive || !user.isActive) {
      res.status(403).json({ error: '본사 가입 승인 대기 중입니다.' });
      return;
    }

    // 단말기 검증 로직 통삭제 완료

    // 로그인 성공
    res.status(200).json({
      message: '로그인 성공',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant.id,
        hospitalName: user.tenant.name,
        token: 'mock-jwt-token-for-' + user.id
      }
    });

  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: '로그인 처리 중 서버 오류가 발생했습니다.' });
  }
};
