import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

// Hash a plain password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare a plain password with its hash
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Sign a JWT token
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

// Verify a JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Helper to get authenticated user in Next.js Server Components, Server Actions, or API Routes
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;
  
  try {
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });
    return user || null;
  } catch (error) {
    return null;
  }
}
