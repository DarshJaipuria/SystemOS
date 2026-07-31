import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { userRepository } from '@/lib/repositories/userRepository';
import { comparePassword, signToken } from '@/lib/auth';
import { CONSTANTS } from '@/lib/constants';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

const loginSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional()
});

async function loginHandler(req, ctx) {
  const { email, password, rememberMe } = ctx.body;
  const traceId = ctx.traceId;

  // Find user
  const user = await userRepository.findByEmail(email.toLowerCase());
  if (!user) {
    logger.warn('LOGIN_FAILED', `User not found: ${email}`, {}, traceId);
    return createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password.', 401);
  }

  // Verify password
  const passwordMatch = await comparePassword(password, user.passwordHash);
  if (!passwordMatch) {
    logger.warn('LOGIN_FAILED', `Incorrect password for user: ${email}`, {}, traceId);
    return createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password.', 401);
  }

  logger.auth(user.id, 'LOGIN_SUCCESS', true, { email: user.email }, traceId);

  // Create session token
  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // Set cookie
  const cookieStore = await cookies();
  const maxAge = rememberMe 
    ? CONSTANTS.COOKIE_MAX_AGE 
    : 24 * 60 * 60; // 30 days or 1 day

  cookieStore.set(CONSTANTS.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge,
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

export const POST = withMiddleware(loginHandler, {
  schema: { body: loginSchema }
});
