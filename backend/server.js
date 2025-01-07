import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import testRoutes from './routes/test.js';
import db from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', testRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Basic database test endpoint
app.get('/test-db', async (req, res) => {
    try {
        const testResult = await db.testConnection();
        console.log('Database test result:', testResult);
        
        res.json({ 
            status: testResult.success ? 'ok' : 'error',
            message: testResult.success ? 'Database connection successful' : 'Database connection failed',
            data: testResult.result,
            error: testResult.error
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Database test failed',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Available test endpoints:');
    console.log('- Health check: GET /health');
    console.log('- Database test: GET /test-db');
    console.log('- Connection test: GET /api/test-connection');
});