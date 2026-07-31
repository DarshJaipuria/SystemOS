import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { CONSTANTS } from '@/lib/constants';
import { config } from '@/lib/config';

async function logoutHandler(req, ctx) {
  const cookieStore = await cookies();
  cookieStore.set(CONSTANTS.JWT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return NextResponse.json({ success: true });
}

export const POST = withMiddleware(logoutHandler);
