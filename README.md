# Shangri-La Petition Platform (SLPP)

A platform that allows citizens of Shangri-La to create and sign petitions on matters within the government's responsibility.

## Project Structure

```
petitionSigner/
├── backend/             # Node.js + Express + TypeScript backend
│   ├── src/            # Source files
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # TypeScript configuration
├── frontend/           # React + TypeScript frontend
│   ├── src/           # Source files
│   └── package.json   # Frontend dependencies
├── BioID_QR_codes/    # QR codes for BioID validation
└── Petition.sql       # Database schema
```

## Technology Stack

- Backend:
  - Node.js
  - Express
  - TypeScript
  - MySQL
  - JWT for authentication

- Frontend:
  - React
  - TypeScript
  - React Router
  - Tailwind CSS
  - Axios

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

3. Create a .env file with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   JWT_SECRET=your_jwt_secret
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

3. Start the development server:
   ```bash
   npm start
   ```

## Features

- User registration and authentication
- Petition creation and signing
- BioID validation with QR code support
- Committee dashboard for managing petitions
- REST API for public access to petition data

## API Documentation

The SLPP Open Data REST API provides the following endpoints:

1. Get all petitions:
   ```
   GET /slpp/petitions
   ```

2. Get open petitions:
   ```
   GET /slpp/petitions?status=open
   ```

More endpoints to be documented as development progresses.