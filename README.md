# IDP Platform

This is a monorepo containing the source code for the IDP Platform, consisting of a NestJS backend and a Next.js frontend.

## Project Structure

- `backend/`: NestJS application (API)
- `frontend/`: Next.js application (UI)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start:dev
   ```
   The backend will run on http://localhost:3000 (default NestJS port).

### Frontend

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
   npm run dev
   ```
   The frontend will run on http://localhost:3000 (default Next.js port).
   > **Note:** If the backend is already running on port 3000, Next.js will usually prompt to use a different port (e.g., 3001).

## Technologies

- **Backend**: NestJS, TypeScript
- **Frontend**: Next.js, React, TailwindCSS, TypeScript
