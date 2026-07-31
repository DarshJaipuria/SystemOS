import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { habitService } from '@/lib/services/habitService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const createMonthlyBodySchema = z.object({
  name: z.string().min(1, 'Monthly habit name is required.').max(100),
  month: z.number().int().min(1).max(12),
  year: z.number().int()
});

async function createMonthlyHandler(req, ctx) {
  const { name, month, year } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const newMonthly = await habitService.createMonthlyHabit(userId, name, month, year);
    return NextResponse.json(newMonthly);
  } catch (error) {
    logger.warn('CREATE_MONTHLY_FAILED', error.message, { userId, name }, traceId);
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message, 400);
  }
}

const updateMonthlyBodySchema = z.object({
  id: z.string().uuid('Invalid monthly habit ID format.'),
  name: z.string().min(1, 'Monthly habit name is required.').max(100).optional(),
  completed: z.boolean().optional()
});

async function updateMonthlyHandler(req, ctx) {
  const { id, name, completed } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const updated = await habitService.updateMonthlyHabit(userId, id, name, completed);
    return NextResponse.json(updated);
  } catch (error) {
    logger.warn('UPDATE_MONTHLY_FAILED', error.message, { userId, id }, traceId);
    return createErrorResponse(ERROR_CODES.NOT_FOUND, error.message, 404);
  }
}

const deleteMonthlyQuerySchema = z.object({
  id: z.string().uuid('Invalid monthly habit ID format.')
});

async function deleteMonthlyHandler(req, ctx) {
  const { id } = ctx.query;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    await habitService.deleteMonthlyHabit(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.warn('DELETE_MONTHLY_FAILED', error.message, { userId, id }, traceId);
    return createErrorResponse(ERROR_CODES.NOT_FOUND, error.message, 404);
  }
}

export const POST = withMiddleware(createMonthlyHandler, {
  requireAuth: true,
  schema: { body: createMonthlyBodySchema }
});

export const PUT = withMiddleware(updateMonthlyHandler, {
  requireAuth: true,
  schema: { body: updateMonthlyBodySchema }
});

export const DELETE = withMiddleware(deleteMonthlyHandler, {
  requireAuth: true,
  schema: { query: deleteMonthlyQuerySchema }
});
