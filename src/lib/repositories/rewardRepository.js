/**
 * Reward and Claims Repository Layer
 */
import { db } from '../db.js';

export const rewardRepository = {
  // Reward Templates
  findManyTemplates: async (userId, month, year) => {
    return db.reward.findMany({
      where: { userId, month, year },
      orderBy: { createdAt: 'asc' },
    });
  },

  saveTemplates: async (userId, month, year, newNames) => {
    return db.$transaction(async (tx) => {
      // 1. Fetch current reward templates
      const currentRewards = await tx.reward.findMany({
        where: { userId, month, year },
      });

      const keptRewards = [];
      const unmatchedNewNames = [];
      const availableCurrentRewards = [...currentRewards];

      // 2. Identify exact matches to keep
      for (const name of newNames) {
        const matchIndex = availableCurrentRewards.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
        if (matchIndex !== -1) {
          keptRewards.push(availableCurrentRewards[matchIndex]);
          availableCurrentRewards.splice(matchIndex, 1);
        } else {
          unmatchedNewNames.push(name);
        }
      }

      const finalRewards = [...keptRewards];

      // 3. Rename remaining slots to the new names
      for (const name of unmatchedNewNames) {
        if (availableCurrentRewards.length > 0) {
          const rewardToRename = availableCurrentRewards.shift();
          const updated = await tx.reward.update({
            where: { id: rewardToRename.id },
            data: { name },
          });
          finalRewards.push(updated);
        } else {
          const created = await tx.reward.create({
            data: {
              userId,
              month,
              year,
              name,
            },
          });
          finalRewards.push(created);
        }
      }

      // 4. Delete any leftover slots
      if (availableCurrentRewards.length > 0) {
        const idsToDelete = availableCurrentRewards.map(r => r.id);
        await tx.reward.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      return finalRewards;
    });
  },

  // Daily Claimed Rewards
  findManyClaims: async (userId, month, year) => {
    return db.claimedReward.findMany({
      where: {
        userId,
        reward: {
          month,
          year,
        },
      },
      include: {
        reward: true,
      },
    });
  },

  saveClaims: async (userId, date, rewardIds) => {
    return db.$transaction(async (tx) => {
      // Delete existing claims for the day
      await tx.claimedReward.deleteMany({
        where: { userId, date },
      });

      // Create new claims
      if (rewardIds.length > 0) {
        // Prisma createMany is supported on MySQL
        await tx.claimedReward.createMany({
          data: rewardIds.map(rewardId => ({
            userId,
            rewardId,
            date,
          })),
        });
      }

      // Fetch updated claims for the day
      return tx.claimedReward.findMany({
        where: { userId, date },
        include: { reward: true },
      });
    });
  },
};
