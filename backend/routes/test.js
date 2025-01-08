import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/test-connection', async (req, res) => {
  try {
    // Test connection by trying to fetch a single row from petitioners
    const { data, error } = await supabase
      .from('petitioners')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Database connection test failed',
        error: error.message
      });
    }
    
    res.json({ 
      status: 'success',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test connection:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;