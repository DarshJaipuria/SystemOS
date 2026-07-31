// FILE: src/app/api/v1/wellness/route.js
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const days = searchParams.get('days');

    if (days) {
      const daysInt = parseInt(days, 10);
      if (isNaN(daysInt) || daysInt <= 0) {
        return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 });
      }
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - daysInt);
      const logs = await db.wellnessLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: pastDate.toISOString().split('T')[0],
          }
        },
        orderBy: { date: 'asc' }
      });
      return NextResponse.json({ logs });
    }

    const log = await db.wellnessLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        }
      }
    });

    return NextResponse.json({ log: log || null });
  } catch (error) {
    console.error('Wellness GET error:', error);
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
    const { 
      date, screenTime, socialMedia, gaming, studyHours, 
      sleep, waterGlasses, exerciseMinutes, meditationMinutes, 
      mood, stress, energy, focus, healthScore 
    } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const savedLog = await db.wellnessLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        }
      },
      update: {
        screenTime, socialMedia, gaming, studyHours,
        sleep, waterGlasses, exerciseMinutes, meditationMinutes,
        mood, stress, energy, focus, healthScore
      },
      create: {
        userId: user.id,
        date, screenTime, socialMedia, gaming, studyHours,
        sleep, waterGlasses, exerciseMinutes, meditationMinutes,
        mood, stress, energy, focus, healthScore
      }
    });

    return NextResponse.json({ log: savedLog });
  } catch (error) {
    console.error('Wellness POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
