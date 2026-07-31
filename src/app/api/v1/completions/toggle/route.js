import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { habitRepository } from '@/lib/repositories/habitRepository';
import { completionRepository } from '@/lib/repositories/completionRepository';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';

const toggleBodySchema = z.object({
  habitId: z.string().min(1, 'Invalid habit ID format.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  completed: z.boolean()
});

async function toggleCompletionHandler(req, ctx) {
  const { habitId, date, completed } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  if (habitId.startsWith('demo_')) {
    return NextResponse.json({ success: true, demo: true });
  }

  // 1. Verify ownership of habit
  try {
    const habit = await habitRepository.findDailyById(habitId);
    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ success: true, localOnly: true });
    }
  } catch (e) {
    return NextResponse.json({ success: true, localOnly: true });
  }

  // 2. Perform Toggle action
  if (completed) {
    try {
      await db.completion.upsert({
        where: {
          habitId_date: { habitId, date }
        },
        update: {},
        create: { habitId, date }
      });
    } catch (error) {
      logger.error('TOGGLE_CREATE_FAILED', 'Failed to create completion checkmark', error, {}, traceId);
      throw error;
    }
  } else {
    try {
      await completionRepository.delete(habitId, date);
    } catch (err) {
      // Ignore record-not-found error to maintain idempotency
      if (err.code !== 'P2025') {
        logger.error('TOGGLE_DELETE_FAILED', 'Failed to delete completion checkmark', err, {}, traceId);
        throw err;
      }
    }
  }

  return NextResponse.json({ success: true });
}

export const POST = withMiddleware(toggleCompletionHandler, {
  requireAuth: true,
  schema: { body: toggleBodySchema }
});
