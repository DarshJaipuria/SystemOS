/**
 * Reward and Claims Domain Service
 */
import { rewardRepository } from '../repositories/rewardRepository.js';
import { CONSTANTS } from '../constants.js';

export const rewardService = {
  /**
   * Calculates the number of rewards unlocked based on completion counts.
   * Rule: 1 reward for every 1/3rd of the total daily habits.
   * @param {number} completionsCount
   * @param {number} totalDailyHabits
   * @param {number} totalTemplatesCount
   * @returns {number}
   */
  getUnlockedRewardsLimit: (completionsCount, totalDailyHabits, totalTemplatesCount = 5) => {
    if (totalDailyHabits === 0) return 0;
    const habitsPerReward = Math.max(1, Math.round(totalDailyHabits / 3));
    return Math.min(totalTemplatesCount, Math.floor(completionsCount / habitsPerReward));
  },

  getTemplates: async (userId, month, year) => {
    return rewardRepository.findManyTemplates(userId, month, year);
  },

  saveTemplates: async (userId, month, year, rewardsList) => {
    const sanitizedNames = rewardsList
      .map(name => name?.trim())
      .filter(Boolean);

    if (sanitizedNames.length === 0) {
      throw new Error('At least one reward option name is required.');
    }
    
    if (sanitizedNames.length > CONSTANTS.PLANNER_LIMITS.MAX_REWARDS) {
      throw new Error(`Maximum reward templates limit of ${CONSTANTS.PLANNER_LIMITS.MAX_REWARDS} reached.`);
    }

    return rewardRepository.saveTemplates(userId, month, year, sanitizedNames);
  },

  getClaims: async (userId, month, year) => {
    return rewardRepository.findManyClaims(userId, month, year);
  },

  claimRewards: async (userId, date, rewardIds, totalDailyHabits, completedCount, totalTemplatesCount) => {
    // 1. Validate eligibility
    const maxAllowed = rewardService.getUnlockedRewardsLimit(completedCount, totalDailyHabits, totalTemplatesCount);
    if (rewardIds.length > maxAllowed) {
      throw new Error(`Invalid claim request: Cannot claim ${rewardIds.length} rewards. Only ${maxAllowed} unlocked.`);
    }

    return rewardRepository.saveClaims(userId, date, rewardIds);
  }
};
