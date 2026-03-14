import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 가입 요청 생성 (위성 시스템에서 호출)
export const createRegistration = async (req: Request, res: Response) => {
  // 이 엔드포인트는 더 이상 사용되지 않습니다.
  // DENTi-Ai 등은 tenant.controller.ts의 joinTenant 라우트(/api/tenants/join)를 이용해
  // 직접 Approval과 비활성 Tenant/User를 생성합니다.
  res.status(400).json({ success: false, error: 'Depreciated API. Use /api/tenants/join instead.' });
};

// 가입 승인 대기 목록 조회 (본사 관리자용)
export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.approval.findMany({
      where: {
        type: 'JOIN_REQUEST',
      },
      orderBy: { requestedAt: 'desc' },
      include: {
        tenant: true,
        requester: true,
      }
    });

    // 프론트엔드 RegistrationApprovalPage가 기대하는 포맷으로 매핑
    const mappedRequests = requests.map(req => {
      const content = req.contentData as any || {};
      return {
        id: req.id,
        hospitalName: req.tenant.name || content.hospitalName,
        ceoName: req.requester.name || content.ceoName || '관리자',
        contactNumber: content.contactNumber || '',
        email: req.requester.email,
        password: content.password || '',
        businessRegistrationNumber: content.businessRegistrationNumber || '',
        address: content.address || '',
        status: req.status, // 'PENDING', 'APPROVED', 'REJECTED'
        requestedAt: req.requestedAt.toISOString(),
        tenantId: req.tenantId,
        requesterId: req.requesterId
      };
    });

    res.status(200).json({ success: true, data: mappedRequests });
  } catch (error) {
    console.error('Error fetching join approvals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
  }
};

// 가입 승인 (본사 관리자용) -> Approval 상태 업데이트 및 비활성 Tenant/User 활성화
export const approveRegistration = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { hospitalCode } = req.body;

  if (!hospitalCode) {
    return res.status(400).json({ success: false, error: '회원병원 ID를 입력해야 승인할 수 있습니다.' });
  }

  try {
    // 1. Approval 내역 조회
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { requester: true }
    });

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }
    if (approval.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Request is not pending' });
    }

    // 2. Transaction 처리: Approval 승인 + 연관된 Tenant 활성화 및 이름 변경 + 연관된 User 활성화 및 claims 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 2-1. Approval 상태 변경
      const updatedApproval = await tx.approval.update({
        where: { id },
        data: {
          status: 'APPROVED',
          resolvedAt: new Date(),
        },
      });

      // 2-2. 연관된 Tenant 활성화 및 회원병원 ID로 이름 변경
      const updatedTenant = await tx.tenant.update({
        where: { id: approval.tenantId },
        data: {
          isActive: true,
          name: hospitalCode // 승인 시 지정한 회원병원 ID 부여
        },
      });

      // 2-3. 연관된 User(대표자) 활성화 및 claims에 회원병원 ID 보관
      const previousClaims = approval.requester.customClaims as any || {};
      const updatedUser = await tx.user.update({
        where: { id: approval.requesterId },
        data: {
          isActive: true,
          customClaims: {
            ...previousClaims,
            hospitalCode
          }
        },
      });

      return { approval: updatedApproval, tenant: updatedTenant, user: updatedUser };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ success: false, error: 'Failed to approve registration' });
  }
};
