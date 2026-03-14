import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const joinTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalName, email, password } = req.body;

    if (!hospitalName || !email || !password) {
      res.status(400).json({ error: '병원명, 이메일, 비밀번호는 필수입니다.' });
      return;
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: '이미 등록된 이메일 또는 병원입니다.' });
      return;
    }

    // 트랜잭션을 사용하여 원자성 보장
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tenant 생성 (승인 전까지 isActive: false, 이름은 가입당시 병원명)
      const tenant = await tx.tenant.create({
        data: {
          name: hospitalName,
          solutionType: 'DENTi-Ai',
          isActive: false,
        },
      });

      // 2. User 생성 (해당 병원의 대표 관리자 계정, 승인 전까지 isActive: false)
      const user = await tx.user.create({
        data: {
          email,
          name: '관리자',
          role: 'ADMIN',
          tenantId: tenant.id,
          isActive: false,
          customClaims: {
            role: 'ADMIN',
            accessibleModules: ['all'],
            password // 추후 bcrypt 암호화 필요
          },
        },
      });

      // 3. Approval 생성 (WAYN-Ai 관리자에게 보일 가입 승인 요청 데이터)
      const approval = await tx.approval.create({
        data: {
          tenantId: tenant.id,
          title: `[DENTi-Ai] ${hospitalName} 가입 승인 요청`,
          type: 'JOIN_REQUEST',
          status: 'PENDING',
          requesterId: user.id,
          contentData: {
            requestDate: new Date().toISOString(),
            email,
            hospitalName
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

  } catch (error: any) {
    console.error('Error during tenant join request:', error);
    res.status(500).json({ 
      error: '가입 신청 처리 중 서버 오류가 발생했습니다.', 
      details: error.message || String(error)
    });
  }
};

// 승인된(활성화된) 회원병원(Tenant) 목록 조회 (WAYN-Ai 관리자용)
export const getApprovedTenants = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
          // 대표 원장님/관리자(ADMIN)를 찾아서 함께 반환 (임시 구현)
          where: {
            role: 'ADMIN'
          },
          take: 1
        }
      }
    });

    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    console.error('Error fetching approved tenants:', error);
    res.status(500).json({ success: false, error: '회원병원 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};
