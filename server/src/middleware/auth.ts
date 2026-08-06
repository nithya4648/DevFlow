// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.model'; // existing User model from previous project

dotenv.config({ path: './.env' });

interface JwtPayload {
  sub: string; // user id
  iat: number;
  exp: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not defined in environment');
    }
    const payload = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // attach user to request
    (req as any).user = user;
    next();
  } catch (err: any) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
