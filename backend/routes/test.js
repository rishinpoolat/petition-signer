import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

router.get('/test-connection', async (req, res) => {
  try {
    const testResult = await db.testConnection();
    
    if (!testResult.success) {
      console.error('Database connection test failed:', testResult.error);
      return res.status(500).json({
        status: 'error',
        message: 'Database connection test failed',
        error: testResult.error
      });
    }
    
    res.json({ 
      status: 'success',
      message: 'Supabase connection successful',
      data: testResult.result,
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