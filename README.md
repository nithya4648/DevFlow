# DevFlow – Developer Workspace Platform

[![CI](https://github.com/nithya4648/DevFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/nithya4648/DevFlow/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A developer workspace platform designed for productivity. Manage projects, code snippets, documentation wikis, encrypted credentials, and bookmarks—all in one place.

**[Live Demo](https://dev-flow-zeta-ashy.vercel.app/)** | **[GitHub Repository](https://github.com/nithya4648/DevFlow)** | **[API Documentation](docs/API.md)**

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, TanStack Query, Monaco Editor, Framer Motion
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, Pino Logger
- **Security & Cryptography**: AES-256-GCM (random IVs per secret), JWT with HTTP-only cookies, bcrypt password hashing, Zod schema validation, ReDoS-safe regex escaping
- **Testing & CI/CD**: Jest, Supertest, MongoDB Memory Server, GitHub Actions CI

---

## ✨ Features & Architecture

- **Documentation Wiki**: Full Markdown editor with instant preview, document download (`.md`), and automated historical version tracking.
- **Kanban & Calendar Projects**: Multi-view project tracking with status lanes, priority tagging, and deep-link navigation.
- **Code Snippet Library**: Monaco-powered multi-language code storage with tagging, folder structure, and favorite toggles.
- **Secure Encrypted Vault**: Zero-leakage secret storage using authenticated AES-256-GCM encryption with unique initialization vectors for API keys and environment variables.
- **Global Search**: Sub-millisecond instant search across all documents, snippets, projects, notes, and bookmarks with ReDoS query protection.
- **Developer Scratchpad & Bookmarks**: Categorized reference link keeper and rich note taking.
- **Centralized Error Handling**: Unified error response normalization for Zod validation, Mongoose duplicates, and server exceptions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Setup & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/nithya4648/DevFlow.git
   cd DevFlow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure backend/.env
   # MONGO_URI=mongodb://localhost:27017/devflow
   # JWT_SECRET=your_jwt_secret
   # ENCRYPTION_KEY=<base64 32-byte key>
   # CLIENT_URL=http://localhost:5173
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & CI

DevFlow includes integration tests covering auth flows, core CRUD operations, pagination, regex sanitization, and cryptographic round-trips:

```bash
cd backend
npm test
```

Automated continuous integration is configured via **GitHub Actions** (`.github/workflows/ci.yml`) on every push and pull request.

---

## 📖 API Documentation

Complete REST API specifications including payload schemas and response shapes are available in **[docs/API.md](docs/API.md)**.
