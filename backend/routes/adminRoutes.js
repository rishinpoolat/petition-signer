import express from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { 
  loginAdmin, 
  updateSignatureThreshold,
  getPetitionStats,
  respondToPetition
} from '../controllers/adminController';

const router = express.Router();

// Admin authentication
router.post('/login', loginAdmin);

// Protected admin routes
router.use(authenticateAdmin);

// Update signature threshold for petitions
router.put('/threshold', updateSignatureThreshold);

// Get petition statistics
router.get('/petition-stats', getPetitionStats);

// Respond to a petition and close it
router.post('/petitions/:id/respond', respondToPetition);

export default router;