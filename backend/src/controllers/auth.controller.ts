import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalCode, email, password, deviceId } = req.body;

    if (!hospitalCode || !email || !password || !deviceId) {
      res.status(400).json({ error: '회원병원 ID, 이메일, 비밀번호, 식별번호는 필수입니다.' });
      return;
    }

    // Tenant 확인
    const tenant = await prisma.tenant.findFirst({
      where: { name: hospitalCode }
    });

    if (!tenant) {
      res.status(404).json({ error: '등록되지 않은 회원병원 ID입니다.' });
      return;
    }

    // User 확인
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.tenantId !== tenant.id) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    // 비밀번호 확인 (현재는 평문 비교, 추후 bcrypt 적용 필요)
    const customClaims = user.customClaims as any || {};
    if (customClaims.password !== password) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    // 승인 대기 상태 확인
    if (!tenant.isActive || !user.isActive) {
      res.status(403).json({ error: '본사 가입 승인 대기 중입니다.' });
      return;
    }

    // 기기 식별번호 일치 여부 확인 (2회차 로그인부터 작동하는 핵심 로직)
    if (customClaims.allowedDeviceId !== deviceId) {
      res.status(403).json({ error: '등록되지 않은 기기입니다. 사용이 중지되었습니다.' });
      return;
    }

    // 로그인 성공
    res.status(200).json({
      message: '로그인 성공',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
        hospitalName: tenant.name,
        // JWT 토큰 등을 여기서 발급하여 내려줄 수 있음
        token: 'mock-jwt-token-for-' + user.id
      }
    });

  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: '로그인 처리 중 서버 오류가 발생했습니다.' });
  }
};
