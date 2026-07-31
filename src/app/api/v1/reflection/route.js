import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { reflectionService } from '@/lib/services/reflectionService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const reflectionBodySchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  text: z.string().optional(),
  affirmation: z.string().optional(),
  polaroidUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable()
});

async function saveReflectionHandler(req, ctx) {
  const { month, year, text, affirmation, polaroidUrl, imageUrl } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const reflection = await reflectionService.saveReflection(userId, month, year, {
      text,
      affirmation,
      polaroidUrl,
      imageUrl
    });
    return NextResponse.json(reflection);
  } catch (error) {
    logger.warn('SAVE_REFLECTION_FAILED', error.message, { userId, month, year }, traceId);
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message, 400);
  }
}

export const POST = withMiddleware(saveReflectionHandler, {
  requireAuth: true,
  schema: { body: reflectionBodySchema }
});
