import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAllPetitions,
  getPetition,
  createPetition,
  signPetition,
  hasSignedPetition,
  getPetitionStats,
  updateThreshold,
  respondToPetition
} from '../controllers/petitionController.js';

const router = express.Router();

// Public routes - for REST API
router.get('/slpp/petitions', getAllPetitions);

// Admin routes - require admin role (place these before generic routes)
router.get('/stats', protect, adminOnly, getPetitionStats);
router.put('/threshold', protect, adminOnly, updateThreshold);

// Public routes
router.get('/', getAllPetitions);

// Protected routes - require authentication
router.post('/', protect, createPetition);

// Routes with ID parameter (place these after specific routes)
router.get('/:id', getPetition);
router.post('/:id/sign', protect, signPetition);
router.get('/:id/signed', protect, hasSignedPetition);
router.post('/:id/respond', protect, adminOnly, respondToPetition);

export default router;