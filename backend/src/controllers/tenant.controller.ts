import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const joinTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantName, solutionType, requesterName, email, contact } = req.body;

    if (!tenantName || !solutionType || !requesterName || !email) {
      res.status(400).json({ error: '필수 입력값이 누락되었습니다.' });
      return;
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
      return;
    }

    // 트랜잭션을 사용하여 원자성 보장
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tenant 생성 (승인 전까지 isActive: false)
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          solutionType,
          isActive: false,
        },
      });

      // 2. User 생성 (해당 병원의 대표 관리자 계정, 승인 전까지 isActive: false)
      const user = await tx.user.create({
        data: {
          email,
          name: requesterName,
          role: 'ADMIN',
          tenantId: tenant.id,
          isActive: false,
          customClaims: {
            role: 'ADMIN',
            accessibleModules: ['all'],
            tempContact: contact // 아직 스키마에 연락처 필드가 없으므로 claims에 임시 저장
          },
        },
      });

      // 3. Approval 생성 (WAYN-Ai 관리자에게 보일 가입 승인 요청 데이터)
      const approval = await tx.approval.create({
        data: {
          tenantId: tenant.id,
          title: `[${solutionType}] ${tenantName} - ${requesterName} 가입 승인 요청`,
          type: 'JOIN_REQUEST',
          status: 'PENDING',
          requesterId: user.id,
          contentData: {
            requestDate: new Date().toISOString(),
            contact,
            email,
            tenantName,
            requesterName,
            solutionType
          },
        },
      });

      return { tenant, user, approval };
    });

    res.status(201).json({
      message: '가입 신청이 완료되었습니다. WAYN-Ai 본사 승인 후 사용 가능합니다.',
      data: {
        tenantId: result.tenant.id,
        approvalId: result.approval.id
      }
    });

  } catch (error) {
    console.error('Error during tenant join request:', error);
    res.status(500).json({ error: '가입 신청 처리 중 서버 오류가 발생했습니다.' });
  }
};
