import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

// 로그인 및 단말기 인증
router.post('/login', login);

export default router;
