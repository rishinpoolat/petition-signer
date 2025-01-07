import express from 'express';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('petitions')
      .select('*');
      
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes (auth required)
router.post('/', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const { data, error } = await supabase
      .from('petitions')
      .insert([
        {
          title,
          content,
          petitioner_id: req.user.id
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin only routes
router.patch('/:id/threshold', protect, adminOnly, async (req, res) => {
  try {
    const { threshold } = req.body;
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('petitions')
      .update({ signature_threshold: threshold })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;