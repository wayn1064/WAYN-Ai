import { Router } from 'express';
import { joinTenant } from '../controllers/tenant.controller';

const router = Router();

// 가입 요청 라우트
router.post('/join', joinTenant);

export default router;
