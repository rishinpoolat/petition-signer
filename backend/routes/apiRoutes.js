import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /slpp/petitions - Return details of all petitions
// Note: When mounted at /slpp, this will be accessible at /slpp/petitions
router.get('/petitions', async (req, res) => {
  try {
    let query = supabase
      .from('petition_stats')
      .select(`
        id,
        status,
        title,
        content,
        petitioner_id,
        petitioners (email),
        signature_count,
        response,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    const status = req.query.status?.toLowerCase();
    if (status === 'open' || status === 'closed') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format response according to API specification
    const formattedPetitions = data.map(petition => ({
      petition_id: petition.id.toString(),
      status: petition.status,
      petition_title: petition.title,
      petition_text: petition.content,
      petitioner: petition.petitioners?.email || '',
      signatures: petition.signature_count.toString(),
      response: petition.response || ""
    }));

    res.json({ petitions: formattedPetitions });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch petitions' });
  }
});

export default router;