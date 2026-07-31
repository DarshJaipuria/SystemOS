import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (user) {
      return NextResponse.json({ user });
    }
  } catch (e) {
    console.warn('Auth check fallback triggered');
  }
  
  // Vercel Serverless / Demo Fallback
  return NextResponse.json({ 
    user: { id: 'demo_user', name: 'DJ', email: 'darshjaipuria@gmail.com' } 
  });
}
