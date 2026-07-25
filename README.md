# DevFlow - The Operating System for Developers

DevFlow is a complete, real-time operating system for developers, built on the MERN stack. It consolidates all your development needs into one platform—from project and snippet management to documentation, secure environment variable vaults, bookmarking, and real-time team collaboration.

## 🚀 Live Demo
[Live App URL (Placeholder)](#)
<!-- Deployed link goes here after deployment -->

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Socket.io-client
- **Backend**: Node.js, Express, MongoDB Atlas, Socket.io, Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **Real-Time**: Socket.io for activity feeds, notifications, and team cursors

## 📂 Folder Structure
```
devflow/
├── backend/          # Express API, MongoDB models, real-time sockets
│   ├── config/       # Database & environment configurations
│   ├── controllers/  # API route logic
│   ├── middleware/   # Auth, error handling, rate limiting
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routes
│   └── server.js     # Entry point
│
└── frontend/         # React SPA (Vite)
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── context/    # React Context providers (Auth, Socket, Theme)
    │   ├── hooks/      # Custom React hooks
    │   ├── layouts/    # Page layouts (Dashboard Layout)
    │   ├── pages/      # Top-level route pages
    │   └── services/   # Axios API calls
    └── index.html    # Entry HTML
```

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd devflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend:
```bash
npm run dev
```

### 4. Visit the Application
Open `http://localhost:5173` in your browser.
