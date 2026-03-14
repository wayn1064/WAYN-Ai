import { Router } from 'express';
import { joinTenant, getApprovedTenants } from '../controllers/tenant.controller';

const router = Router();

// 승인된 회원병원 조회 라우트
router.get('/', getApprovedTenants);

// 가입 요청 라우트
router.post('/join', joinTenant);

export default router;
