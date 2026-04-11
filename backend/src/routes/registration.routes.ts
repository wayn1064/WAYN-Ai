import { Router } from 'express';
import {
  createRegistration,
  getRegistrations,
  approveRegistration,
  rejectRegistration,
  updateRegistration,
  deleteRegistration
} from '../controllers/registration.controller';

const router = Router();

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.post('/:id/approve', approveRegistration);
router.post('/:id/reject', rejectRegistration);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

export default router;
