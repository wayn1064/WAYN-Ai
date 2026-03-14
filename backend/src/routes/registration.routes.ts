import { Router } from 'express';
import {
  createRegistration,
  getRegistrations,
  approveRegistration,
} from '../controllers/registration.controller';

const router = Router();

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.post('/:id/approve', approveRegistration);

export default router;
