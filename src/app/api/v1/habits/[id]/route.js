import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { habitService } from '@/lib/services/habitService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const habitParamsSchema = z.object({
  id: z.string().uuid('Invalid habit ID format.')
});

const updateHabitBodySchema = z.object({
  name: z.string().min(1, 'Habit name is required.').max(100).optional(),
  goalDays: z.number().int().min(1).max(31).optional(),
});

async function updateHabitHandler(req, ctx) {
  const { id } = ctx.params;
  const { name, goalDays } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const updated = await habitService.updateDailyHabit(userId, id, name, goalDays);
    return NextResponse.json(updated);
  } catch (error) {
    logger.warn('UPDATE_HABIT_FAILED', error.message, { userId, id }, traceId);
    return createErrorResponse(ERROR_CODES.NOT_FOUND, error.message, 404);
  }
}

async function deleteHabitHandler(req, ctx) {
  const { id } = ctx.params;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    await habitService.deleteDailyHabit(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.warn('DELETE_HABIT_FAILED', error.message, { userId, id }, traceId);
    return createErrorResponse(ERROR_CODES.NOT_FOUND, error.message, 404);
  }
}

export const PUT = withMiddleware(updateHabitHandler, {
  requireAuth: true,
  schema: {
    params: habitParamsSchema,
    body: updateHabitBodySchema
  }
});

export const DELETE = withMiddleware(deleteHabitHandler, {
  requireAuth: true,
  schema: {
    params: habitParamsSchema
  }
});
