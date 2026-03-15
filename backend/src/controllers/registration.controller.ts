import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 가입 요청 생성 (위성 시스템에서 호출 또는 본사 수동 추가)
export const createRegistration = async (req: Request, res: Response) => {
  const { 
    hospitalName, 
    ceoName, 
    contactNumber, 
    email, 
    password, 
    businessRegistrationNumber, 
    address, 
    accessibleMenus,
    status
  } = req.body;

  try {
    const defaultMenus = accessibleMenus || ['원장실', '경영지원실', '진료실', '기공실', '데스크', '중앙공급실', '상담실', '마이오피스'];

    const result = await prisma.$transaction(async (tx) => {
      // 0. Check duplicate email
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('DUPLICATE_EMAIL');
      }

      // 1. Create active tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: hospitalName,
          solutionType: 'DENTi-Ai',
          isActive: status === 'APPROVED' ? true : false
        }
      });

      // 2. Create master user
      const newUser = await tx.user.create({
        data: {
          email,
          name: ceoName,
          role: 'ADMIN',
          tenantId: newTenant.id,
          isActive: status === 'APPROVED' ? true : false,
          customClaims: {
            role: 'ADMIN',
            accessibleMenus: defaultMenus,
            hospitalCode: hospitalName,
            password: password || ''
          }
        }
      });

      // 3. Create Approval record
      const newApproval = await tx.approval.create({
        data: {
          tenantId: newTenant.id,
          title: `${hospitalName} 가입`,
          type: 'JOIN_REQUEST',
          status: status || 'PENDING',
          requesterId: newUser.id,
          resolvedAt: status === 'APPROVED' ? new Date() : null,
          contentData: {
            hospitalName,
            ceoName,
            contactNumber,
            email,
            password,
            businessRegistrationNumber,
            address,
            accessibleMenus: defaultMenus
          }
        }
      });

      return { tenant: newTenant, user: newUser, approval: newApproval };
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(400).json({ success: false, error: '이미 사용 중인 마스터 이메일입니다.' });
    }
    console.error('Error creating registration:', error);
    res.status(500).json({ success: false, error: '신규 거래처 등록 중 서버 단에서 오류가 발생했습니다.' });
  }
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

// 가입 세부 정보 및 권한 수정 (본사 관리자용)
export const updateRegistration = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { 
    hospitalName, 
    ceoName, 
    contactNumber, 
    address, 
    businessRegistrationNumber,
    email,
    password,
    accessibleMenus
  } = req.body;

  try {
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { requester: true }
    });

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }

    const previousContent = approval.contentData as any || {};
    const updatedContent = {
      ...previousContent,
      hospitalName: hospitalName || previousContent.hospitalName,
      ceoName: ceoName || previousContent.ceoName,
      contactNumber: contactNumber || previousContent.contactNumber,
      address: address || previousContent.address,
      businessRegistrationNumber: businessRegistrationNumber || previousContent.businessRegistrationNumber,
      email: email || previousContent.email,
      password: password || previousContent.password,
      accessibleMenus: accessibleMenus || previousContent.accessibleMenus || []
    };

    const previousClaims = approval.requester.customClaims as any || {};
    const updatedClaims = {
      ...previousClaims,
      accessibleMenus: accessibleMenus || previousClaims.accessibleMenus || [],
      password: updatedContent.password
    };

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Approval Content
      const updatedApproval = await tx.approval.update({
        where: { id },
        data: {
          contentData: updatedContent
        }
      });

      // 2. Update User (Requester) Information & Claims
      const updatedUser = await tx.user.update({
        where: { id: approval.requesterId },
        data: {
          name: ceoName || approval.requester.name,
          email: email || approval.requester.email,
          customClaims: updatedClaims
        }
      });

      // 3. Update Tenant Name if changed
      const updatedTenant = await tx.tenant.update({
        where: { id: approval.tenantId },
        data: {
          name: hospitalName || undefined
        }
      });

      return { approval: updatedApproval, user: updatedUser, tenant: updatedTenant };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ success: false, error: 'Failed to update registration' });
  }
};

// 가입 세부 정보 삭제 (본사 관리자용)
export const deleteRegistration = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { requester: true, tenant: true }
    });

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }

    const { tenantId } = approval;

    await prisma.$transaction(async (tx) => {
      // 1. Delete all Approvals associated with the tenant
      await tx.approval.deleteMany({
        where: { tenantId }
      });

      // 2. Delete all Users associated with the tenant
      await tx.user.deleteMany({
        where: { tenantId }
      });

      // 3. Delete the Tenant
      await tx.tenant.delete({
        where: { id: tenantId }
      });
    });

    res.status(200).json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, error: 'Failed to delete registration' });
  }
};
