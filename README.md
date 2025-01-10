# Shangri-La Petition Platform (SLPP)

A platform that allows citizens of Shangri-La to create and sign petitions on matters within the government's responsibility. Built using Node.js, React.js, and Supabase.

## Project Structure

```
petitionSigner/
├── frontend/          # React.js frontend application
├── backend/           # Node.js backend server
├── supabase_migrations/  # Database migrations
└── BioID_QR_codes/   # QR codes for BioID verification
```

## Technology Stack

- Backend:
  - Node.js
  - Express
  - TypeScript
  - Supabase (Database)
  - JWT for authentication

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Supabase Client

## Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)
- Supabase account and project setup

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=5002
   NODE_ENV=development
   JWT_SECRET=thisissecret
   SUPABASE_URL=https://wpgzvhpnkbqhzpvshmzp.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZ3p2aHBua2JxaHpwdnNobXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI1ODc5NSwiZXhwIjoyMDUxODM0Nzk1fQ.2GOCqofSoyux97D3bhcqdoYdOulLPvHy30xxqZDddvs
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```env
   VITE_API_URL=http://localhost:5002
   VITE_SUPABASE_URL=https://wpgzvhpnkbqhzpvshmzp.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZ3p2aHBua2JxaHpwdnNobXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNTg3OTUsImV4cCI6MjA1MTgzNDc5NX0.Ai8TvNxS56NsezjbBaQZJWp_G9kpMYbAYZctwCpAU5c
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Features

- User registration with BioID validation
- Petition creation and signing
- QR code scanning for BioID validation
- Committee dashboard for managing petitions
- REST API for public access to petition data

## API Documentation

The SLPP Open Data REST API provides the following endpoints:

1. Get all petitions:
   ```
   GET /slpp/petitions
   ```
   Returns all petitions with their details including status, title, text, petitioner, signatures, and response.

2. Get open petitions:
   ```
   GET /slpp/petitions?status=open
   ```
   Returns only the petitions that are currently open for signatures.

## Default Admin Credentials

```
Email: admin@petition.parliament.sr
Password: 2025%shangrila
```

## Testing

To run the automated tests for the REST API endpoints:

```bash
cd backend
npm test
```

## Note

- The backend server runs on port 5002
- The frontend application connects to the backend at http://localhost:5002
- Make sure both Supabase URL and keys are properly configured in the environment files
- Ensure all the environment variables are set before running the application