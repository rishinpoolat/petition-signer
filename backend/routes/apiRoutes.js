import express from 'express';
import { getPublicPetitions } from '../controllers/apiController.js';

const router = express.Router();

// GET /slpp/petitions - Return details of all petitions
// Note: When mounted at /slpp, this will be accessible at /slpp/petitions
router.get('/petitions', getPublicPetitions);

export default router;