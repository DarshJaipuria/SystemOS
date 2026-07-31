// FILE: src/app/api/v1/pomodoro/route.js
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
    const date = searchParams.get('date');
    const days = searchParams.get('days');

    let whereClause = { userId: user.id };

    if (date) {
      whereClause.date = date;
    } else if (days) {
      const daysInt = parseInt(days, 10);
      if (!isNaN(daysInt) && daysInt > 0) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysInt);
        whereClause.date = {
          gte: pastDate.toISOString().split('T')[0]
        };
      }
    }

    const sessions = await db.pomodoroSession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });

    if (days) {
      const totalMinutes = sessions.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
      return NextResponse.json({ sessions, totalMinutes, sessionCount: sessions.length });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Pomodoro GET error:', error);
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
    const { date, subject, minutes, completed } = body;

    if (!date || minutes === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const createdSession = await db.pomodoroSession.create({
      data: {
        userId: user.id,
        date,
        subject,
        minutes,
        completed: Boolean(completed)
      }
    });

    return NextResponse.json(createdSession);
  } catch (error) {
    console.error('Pomodoro POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
