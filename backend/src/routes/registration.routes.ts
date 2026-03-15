import { Router } from 'express';
import {
  createRegistration,
  getRegistrations,
  approveRegistration,
  updateRegistration,
  deleteRegistration
} from '../controllers/registration.controller';

const router = Router();

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.post('/:id/approve', approveRegistration);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

export default router;
