import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import petitionRoutes from './routes/petitionRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';  // Fixed extension

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/petitions', petitionRoutes);
app.use('/api/admin', adminRoutes);  // Added admin routes
app.use('/slpp', apiRoutes); // Open Data REST API endpoints

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: [
      {
        path: '/slpp/petitions',
        method: 'GET',
        description: 'Get all petitions',
        parameters: [],
        example_response: {
          petitions: [
            {
              petition_id: '1',
              status: 'closed',
              petition_title: 'Example Petition',
              petition_text: 'Example petition text...',
              petitioner: 'example@email.com',
              signatures: '123',
              response: 'Example response...'
            }
          ]
        }
      },
      {
        path: '/slpp/petitions',
        method: 'GET',
        description: 'Get open petitions',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filter by status (open/closed)'
          }
        ],
        example_response: {
          petitions: [
            {
              petition_id: '2',
              status: 'open',
              petition_title: 'Example Open Petition',
              petition_text: 'Example petition text...',
              petitioner: 'example@email.com',
              signatures: '45',
              response: ''
            }
          ]
        }
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`REST API available at http://localhost:${PORT}/slpp/petitions`);
  console.log(`API Documentation available at http://localhost:${PORT}/api/docs`);
});