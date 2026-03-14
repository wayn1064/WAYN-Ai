import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 가입 요청 생성 (위성 시스템에서 호출)
export const createRegistration = async (req: Request, res: Response) => {
  try {
    const { hospitalName, ceoName, contactNumber, email } = req.body;

    const request = await prisma.registrationRequest.create({
      data: {
        hospitalName,
        ceoName,
        contactNumber,
        email,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Error creating registration request:', error);
    res.status(500).json({ success: false, error: 'Failed to create registration request' });
  }
};

// 가입 요청 목록 조회 (본사 관리자용)
export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.registrationRequest.findMany({
      orderBy: { requestedAt: 'desc' },
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
  }
};

// 가입 승인 (본사 관리자용) -> Tenant, User 생성 후 결재 기록
export const approveRegistration = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    // 1. 요청 내역 조회
    const request = await prisma.registrationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ success: false, error: 'Registration request not found' });
    }
    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Request is not pending' });
    }

    // 2. Transaction 처리: 승인 상태 변경 + Tenant 생성 + Admin User 생성
    const result = await prisma.$transaction(async (tx) => {
      // 2-1. RegistrationRequest 상태 변경
      const updatedRequest = await tx.registrationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          resolvedAt: new Date(),
        },
      });

      // 2-2. Tenant(병원/가맹점 마스터) 생성
      const tenant = await tx.tenant.create({
        data: {
          name: request.hospitalName,
          solutionType: 'DENTi-Ai', // TODO: 추후 다중 솔루션 지원 시 파라미터화 필요
          isActive: true,
        },
      });

      // 2-3. User(최초 관리자/원장 계정) 생성
      const user = await tx.user.create({
        data: {
          email: request.email,
          name: request.ceoName,
          role: 'ADMIN',
          tenantId: tenant.id,
          // Custom Claims로 전체 권한 부여 모사
          customClaims: { role: 'ADMIN', accessibleModules: ['all'] },
          isActive: true,
        },
      });

      return { request: updatedRequest, tenant, user };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ success: false, error: 'Failed to approve registration' });
  }
};
