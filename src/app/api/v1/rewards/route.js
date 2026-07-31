import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { rewardService } from '@/lib/services/rewardService';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const getRewardsQuerySchema = z.object({
  month: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(12)),
  year: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int())
});

async function getRewardsHandler(req, ctx) {
  const { month, year } = ctx.query;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  const rewards = await rewardService.getTemplates(userId, month, year);
  const claimedRewards = await rewardService.getClaims(userId, month, year);

  return NextResponse.json({ rewards, claimedRewards });
}

const saveRewardsBodySchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  rewards: z.array(z.string())
});

async function saveRewardsHandler(req, ctx) {
  const { month, year, rewards: newRewardsList } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    const updatedTemplates = await rewardService.saveTemplates(userId, month, year, newRewardsList);
    return NextResponse.json({ success: true, rewards: updatedTemplates });
  } catch (error) {
    logger.warn('SAVE_REWARDS_FAILED', error.message, { userId, month, year }, traceId);
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message, 400);
  }
}

export const GET = withMiddleware(getRewardsHandler, {
  requireAuth: true,
  schema: { query: getRewardsQuerySchema }
});

export const POST = withMiddleware(saveRewardsHandler, {
  requireAuth: true,
  schema: { body: saveRewardsBodySchema }
});
