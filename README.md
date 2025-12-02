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
   The backend will run on http://localhost:3001.

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

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file.

### Backend

Create a `.env` file in the `backend` directory:

```bash
GEMINI_API_KEY=your_gemini_api_key
JENKINS_JOB_NAME=default-pipeline # Optional
```

### Frontend

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001 # URL of the backend API
```

## Technologies

- **Backend**: NestJS, TypeScript
- **Frontend**: Next.js, React, TailwindCSS, TypeScript
