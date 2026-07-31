import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { userRepository } from '@/lib/repositories/userRepository';
import { hashPassword, signToken } from '@/lib/auth';
import { CONSTANTS } from '@/lib/constants';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

const registerSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  name: z.string().optional().nullable()
});

async function registerHandler(req, ctx) {
  const { email, password, name } = ctx.body;
  const traceId = ctx.traceId;

  // Check if user already exists
  const existingUser = await userRepository.findByEmail(email.toLowerCase());
  if (existingUser) {
    logger.warn('REGISTRATION_CONFLICT', `Email already exists: ${email}`, {}, traceId);
    return createErrorResponse(ERROR_CODES.CONFLICT, 'An account with this email already exists.', 400);
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const user = await userRepository.create(email.toLowerCase(), passwordHash, name);

  logger.auth(user.id, 'REGISTER_SUCCESS', true, { email: user.email }, traceId);

  // Create session token
  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(CONSTANTS.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge: CONSTANTS.COOKIE_MAX_AGE,
    path: '/',
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

export const POST = withMiddleware(registerHandler, {
  schema: { body: registerSchema }
});
