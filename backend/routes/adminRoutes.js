import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { 
  loginAdmin, 
  updateSignatureThreshold,
  getPetitionStats,
  respondToPetition
} from '../controllers/adminController.js';

const router = express.Router();

// Admin authentication
router.post('/login', loginAdmin);

// Protected admin routes
router.use(protect); // First verify authentication
router.use(adminOnly); // Then verify admin role

// Update signature threshold for petitions
router.put('/threshold', updateSignatureThreshold);

// Get petition statistics
router.get('/petition-stats', getPetitionStats);

// Respond to a petition and close it
router.post('/petitions/:id/respond', respondToPetition);

export default router;