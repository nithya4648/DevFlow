# DevFlow — The Operating System for Developers

MERN stack SaaS combining the developer tools you use daily (JSON tools, snippets, projects, notes, env vault) into one workspace.

## Structure
- `backend/` — Express + MongoDB API
- `frontend/` — React 19 + Vite + Tailwind

## Setup
1. `cd backend && npm install && cp .env.example .env` (fill in your Mongo URI, JWT secret)
2. `cd frontend && npm install && cp .env.example .env`
3. Run backend: `npm run dev` (in backend/)
4. Run frontend: `npm run dev` (in frontend/)

## Status
Milestone 1 (Foundation) complete: folder structure, DB connection, error handling, health check API, base React app with routing + Tailwind.
