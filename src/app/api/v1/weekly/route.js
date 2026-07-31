import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { habitService } from '@/lib/services/habitService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const createWeeklyBodySchema = z.object({
  name: z.string().min(1, 'Weekly habit name is required.').max(100),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  weekIndex: z.number().int().min(1).max(5)
});

async function createWeeklyHandler(req, ctx) {
  const { name, month, year, weekIndex } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const newWeekly = await habitService.createWeeklyHabit(userId, name, month, year, weekIndex);
    return NextResponse.json(newWeekly);
  } catch (error) {
    logger.warn('CREATE_WEEKLY_FAILED', error.message, { userId, name }, traceId);
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message, 400);
  }
}

const updateWeeklyBodySchema = z.object({
  id: z.string().uuid('Invalid weekly habit ID format.'),
  name: z.string().min(1, 'Weekly habit name is required.').max(100).optional(),
  completed: z.boolean().optional()
});

async function updateWeeklyHandler(req, ctx) {
  const { id, name, completed } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const updated = await habitService.updateWeeklyHabit(userId, id, name, completed);
    return NextResponse.json(updated);
  } catch (error) {
    logger.warn('UPDATE_WEEKLY_FAILED', error.message, { userId, id }, traceId);
    return createErrorResponse(ERROR_CODES.NOT_FOUND, error.message, 404);
  }
}

const deleteWeeklyQuerySchema = z.object({
  id: z.string().uuid('Invalid weekly habit ID format.')
});

async function deleteWeeklyHandler(req, ctx) {
  const { id } = ctx.query;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    await habitService.deleteWeeklyHabit(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.warn('DELETE_WEEKLY_FAILED', error.message, { userId, id }, traceId);
    return createErrorResponse(ERROR_CODES.NOT_FOUND, error.message, 404);
  }
}

export const POST = withMiddleware(createWeeklyHandler, {
  requireAuth: true,
  schema: { body: createWeeklyBodySchema }
});

export const PUT = withMiddleware(updateWeeklyHandler, {
  requireAuth: true,
  schema: { body: updateWeeklyBodySchema }
});

export const DELETE = withMiddleware(deleteWeeklyHandler, {
  requireAuth: true,
  schema: { query: deleteWeeklyQuerySchema }
});
