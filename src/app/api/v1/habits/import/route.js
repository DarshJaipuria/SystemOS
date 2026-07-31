import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { habitService } from '@/lib/services/habitService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const importBodySchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  prevMonth: z.number().int().min(1).max(12),
  prevYear: z.number().int()
});

async function importHabitsHandler(req, ctx) {
  const { month, year, prevMonth, prevYear } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    await habitService.importPreviousMonthHabits(userId, prevMonth, prevYear, month, year);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('IMPORT_HABITS_FAILED', `Failed to import habits for user: ${userId}`, error, {}, traceId);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to import previous habits. Please try again.', 500);
  }
}

export const POST = withMiddleware(importHabitsHandler, {
  requireAuth: true,
  schema: { body: importBodySchema }
});
