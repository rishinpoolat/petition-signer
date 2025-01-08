import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /slpp/petitions - Return details of all petitions
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

    // Add status filter if provided
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format response according to API specification
    const formattedPetitions = data.map(petition => ({
      petition_id: petition.id,
      status: petition.status,
      petition_title: petition.title,
      petition_text: petition.content,
      petitioner: petition.petitioners?.email,
      signatures: petition.signature_count.toString(),
      response: petition.response || ""
    }));

    res.json({ petitions: formattedPetitions });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch petitions' });
  }
});

// GET /slpp/petitions?status=open - Return details of open petitions
router.get('/petitions/open', async (req, res) => {
  try {
    const { data, error } = await supabase
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
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format response according to API specification
    const formattedPetitions = data.map(petition => ({
      petition_id: petition.id,
      status: petition.status,
      petition_title: petition.title,
      petition_text: petition.content,
      petitioner: petition.petitioners?.email,
      signatures: petition.signature_count.toString(),
      response: petition.response || ""
    }));

    res.json({ petitions: formattedPetitions });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch open petitions' });
  }
});

export default router;