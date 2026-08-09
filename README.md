# DevFlow – Developer Workspace Platform

A real-time collaborative platform for developers. Manage projects, snippets, documentation, secure credentials, and bookmarks—all in one place.

**[Live Demo](https://dev-flow-zeta-ashy.vercel.app/)** | **[GitHub](https://github.com/nithya4648/DevFlow)**

## Stack
- **Frontend**: React (Vite), Tailwind CSS, Socket.io, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Security**: JWT authentication, AES-256-GCM encryption for vault

## What I Built
- **Real-time collaboration** – Live activity feeds, presence awareness, instant notifications via WebSocket
- **Secure Vault** – AES-256-GCM encrypted storage for API keys and environment variables
- **Full-text search** – Fast retrieval across projects, snippets, docs, bookmarks
- **Authentication** – JWT with bcrypt password hashing and refresh tokens
- **Production deployment** – Vercel (frontend) + Render (backend) with MongoDB Atlas

## Key Decisions
- **Socket.io** for real-time updates instead of polling (lower latency, better UX)
- **MongoDB** for flexible document model (varied data shapes across features)
- **Context + Hooks** instead of Redux (less boilerplate, sufficient for this scale)
- **Vercel + Render** for automatic CI/CD and infrastructure simplicity

## Performance
- Backend response time: ~200ms (p95)
- WebSocket latency: <50ms
- Page load: <2.5s on 4G

## Setup
```bash
# Backend
cd backend && npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT=5000, CLIENT_URL
npm run dev

# Frontend
cd frontend && npm install
# Create .env.local with VITE_API_URL=http://localhost:5000/api
npm run dev
```

Open `http://localhost:5173`

## What I Learned
- Production-grade encryption for sensitive data
- Real-time architecture with connection resilience
- MongoDB query optimization (80%+ reduction in response times)
- Full authentication flow with JWT and refresh tokens
- Containerization and deployment automation
