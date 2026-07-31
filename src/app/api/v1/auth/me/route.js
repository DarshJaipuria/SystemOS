import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { getAuthenticatedUser } from '@/lib/auth';
import { CONSTANTS } from '@/lib/constants';

async function meHandler(req, ctx) {
  const user = await getAuthenticatedUser();
  return NextResponse.json({ user });
}

export const GET = withMiddleware(meHandler);
