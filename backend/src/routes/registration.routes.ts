import { Router } from 'express';
import {
  createRegistration,
  getRegistrations,
  approveRegistration,
  updateRegistration
} from '../controllers/registration.controller';

const router = Router();

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.post('/:id/approve', approveRegistration);
router.put('/:id', updateRegistration);

export default router;
