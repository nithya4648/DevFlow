# Deployment Guide

This document outlines the steps to deploy DevFlow to a production environment using MongoDB Atlas, Render (Backend), and Vercel (Frontend).

## 1. Database: MongoDB Atlas

1. **Create an Account/Cluster**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new free-tier cluster.
2. **Database Access**: Under "Database Access", create a new database user. Save the username and password securely.
3. **Network Access**: Under "Network Access", add a new IP Address. To allow connections from Render, you can choose "Allow Access from Anywhere" (`0.0.0.0/0`), or manually whitelist Render's IP addresses if you prefer a stricter setup.
4. **Get Connection String**: Go to "Databases", click "Connect", choose "Connect your application", and copy the connection string. Replace `<password>` with the password you created in step 2.

## 2. Backend: Render

1. **Create an Account**: Sign up at [Render](https://render.com/).
2. **New Web Service**: Click "New" > "Web Service".
3. **Connect Repository**: Connect your GitHub repository containing the DevFlow code.
4. **Configuration**:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)
5. **Environment Variables**: Add the following under the "Environment" tab:
   - `PORT`: `5000` (Optional, Render assigns one automatically)
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A secure, randomly generated string)
   - `CLIENT_URL`: (The URL of your deployed frontend, e.g., `https://devflow-app.vercel.app`)
6. **Deploy**: Save and deploy. Once complete, Render will provide a URL for your backend (e.g., `https://devflow-api.onrender.com`).

## 3. Frontend: Vercel

1. **Create an Account**: Sign up at [Vercel](https://vercel.com/).
2. **New Project**: Click "Add New..." > "Project".
3. **Connect Repository**: Connect your GitHub repository containing the DevFlow code.
4. **Configuration**:
   - **Root Directory**: Edit and select `frontend`
   - **Framework Preset**: Vite (Vercel should auto-detect this)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**: Add the following variable:
   - `VITE_API_URL`: (Your Render backend URL followed by `/api`, e.g., `https://devflow-api.onrender.com/api`)
6. **Deploy**: Click Deploy. Vercel will build and host your frontend, providing a live URL.

## 4. Final Verification
- Ensure the `CLIENT_URL` in the Render backend perfectly matches the live Vercel URL (including `https://` and excluding any trailing slashes).
- Open the Vercel frontend URL, create an account, and ensure all features (projects, snippets, real-time activity) function correctly.
