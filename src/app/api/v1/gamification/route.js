// FILE: src/app/api/v1/gamification/route.js
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const state = await db.gamificationState.findUnique({
      where: { userId: user.id }
    });

    if (!state) {
      return NextResponse.json({ xp: 0, level: 1, coins: 0, badges: [], missions: {} });
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Gamification GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { xp, level, coins, badges, missions } = body;

    const savedState = await db.gamificationState.upsert({
      where: { userId: user.id },
      update: { xp, level, coins, badges, missions },
      create: { userId: user.id, xp, level, coins, badges, missions }
    });

    return NextResponse.json(savedState);
  } catch (error) {
    console.error('Gamification POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
