import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // React app's URL
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SLPP API' });
});

// Test route for petition stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalPetitions: 25,
    activePetitions: 15,
    totalSignatures: 1250,
    recentPetitions: [
      { id: 1, title: "Improve Public Transportation" },
      { id: 2, title: "Green Energy Initiative" }
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for ${corsOptions.origin}`);
});