import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withMiddleware } from '@/lib/middleware/withMiddleware';
import { rewardService } from '@/lib/services/rewardService';
import { habitRepository } from '@/lib/repositories/habitRepository';
import { rewardRepository } from '@/lib/repositories/rewardRepository';
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

const claimBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  claimedRewardIds: z.array(z.string().uuid('Invalid reward template ID format.'))
});

async function claimRewardsHandler(req, ctx) {
  const { date, claimedRewardIds } = ctx.body;
  const userId = ctx.user.id;
  const traceId = ctx.traceId;

  try {
    // 1. Parse date coordinates
    const [year, month, day] = date.split('-').map(Number);

    // 2. Fetch daily habits to evaluate completions count on this date
    const habits = await habitRepository.findManyDaily(userId, month, year);
    const completedCount = habits.filter(h => h.completions.some(c => c.date === date)).length;

    // 3. Fetch active templates to verify limit thresholds
    const templates = await rewardRepository.findManyTemplates(userId, month, year);

    // 4. Delegate claims sync & validation checking to rewardService
    await rewardService.claimRewards(
      userId, 
      date, 
      claimedRewardIds, 
      habits.length, 
      completedCount, 
      templates.length
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('CLAIM_REWARDS_FAILED', `Failed to claim rewards for user: ${userId} on date ${date}`, error, {}, traceId);
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message, 400);
  }
}

export const POST = withMiddleware(claimRewardsHandler, {
  requireAuth: true,
  schema: { body: claimBodySchema }
});
