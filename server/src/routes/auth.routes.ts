// src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.model';

dotenv.config({ path: './.env' });

const router = Router();

// Login (single-user or multi-user)
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not defined in .env');
  }
  const token = jwt.sign({ sub: user._id }, secret, { expiresIn: '7d' });
  // HttpOnly cookie
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false }); // set secure:true in production
  res.json({ message: 'Login successful' });
});

// Optional registration endpoint (useful for multi‑user setups)
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 12);
  const newUser = await User.create({ email, password: hashed, name });
  res.status(201).json({ message: 'User created', userId: newUser._id });
});

export default router;
