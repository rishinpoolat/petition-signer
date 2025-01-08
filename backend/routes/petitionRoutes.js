import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllPetitions,
  getPetition,
  createPetition,
  signPetition,
  hasSignedPetition
} from '../controllers/petitionController.js';

const router = express.Router();

// Public routes
router.get('/', getAllPetitions);
router.get('/:id', getPetition);

// Protected routes - require authentication
router.post('/', protect, createPetition);
router.post('/:id/sign', protect, signPetition);
router.get('/:id/signed', protect, hasSignedPetition);

export default router;