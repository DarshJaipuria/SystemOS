import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { habitService } from '@/lib/services/habitService';
import { reflectionService } from '@/lib/services/reflectionService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const getHabitsQuerySchema = z.object({
  month: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(12)),
  year: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int())
});

async function getHabitsHandler(req, ctx) {
  const { month, year } = ctx.query;
  const userId = ctx.user?.id || 'demo_user';

  try {
    const habits = await habitService.getDailyHabits(userId, month, year);
    const weeklyHabits = await habitService.getWeeklyHabits(userId, month, year);
    const monthlyHabits = await habitService.getMonthlyHabits(userId, month, year);
    const reflection = await reflectionService.getReflection(userId, month, year);

    let hasPrevMonthHabits = false;
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    if (habits.length === 0) {
      const prevHabits = await habitService.getDailyHabits(userId, prevMonth, prevYear);
      hasPrevMonthHabits = prevHabits.length > 0;
    }

    return NextResponse.json({
      habits,
      weeklyHabits,
      monthlyHabits,
      reflection,
      hasPrevMonthHabits,
      prevMonthDetails: { month: prevMonth, year: prevYear },
    });
  } catch (dbErr) {
    console.warn('DB query failed on serverless, returning demo habits fallback:', dbErr.message);
    const { demoMode } = await import('@/lib/demoMode');
    demoMode.enable();
    const demoHabits = demoMode.getDemoHabits();

    const defaultWeekly = [
      { id: 'w_demo_1', weekIndex: 1, name: 'Organize study planner', completed: true },
      { id: 'w_demo_2', weekIndex: 2, name: 'Review week 1 & 2 notes', completed: true },
      { id: 'w_demo_3', weekIndex: 3, name: 'Complete practice test', completed: false },
      { id: 'w_demo_4', weekIndex: 4, name: 'Summarize key subjects', completed: false },
      { id: 'w_demo_5', weekIndex: 5, name: 'Plan next month goals', completed: false }
    ];
    const defaultMonthly = [
      { id: 'm_demo_1', name: 'Read 1 Skill / Non-Fiction Book', completed: true },
      { id: 'm_demo_2', name: 'Maintain 80%+ Health Score all month', completed: false },
      { id: 'm_demo_3', name: 'Complete 20+ Pomodoro Sessions', completed: true }
    ];

    return NextResponse.json({
      habits: demoHabits,
      weeklyHabits: defaultWeekly,
      monthlyHabits: defaultMonthly,
      reflection: null,
      hasPrevMonthHabits: false,
      prevMonthDetails: { month: month - 1 || 12, year: month === 1 ? year - 1 : year },
    });
  }
}

const createHabitBodySchema = z.object({
  name: z.string().min(1, 'Habit name is required.').max(100),
  goalDays: z.number().int().min(1).max(31).optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int()
});

async function createHabitHandler(req, ctx) {
  const { name, goalDays, month, year } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const newHabit = await habitService.createDailyHabit(userId, name, goalDays, month, year);
    return NextResponse.json(newHabit);
  } catch (error) {
    logger.warn('CREATE_HABIT_FAILED', error.message, { userId, name }, traceId);
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message, 400);
  }
}

export const GET = withMiddleware(getHabitsHandler, {
  requireAuth: true,
  schema: { query: getHabitsQuerySchema }
});

export const POST = withMiddleware(createHabitHandler, {
  requireAuth: true,
  schema: { body: createHabitBodySchema }
});
