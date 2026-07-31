/**
 * Subscription Domain Service
 */
import { featureFlags } from '../featureFlags.js';

export const subscriptionService = {
  /**
   * Check if a user is within their active plan tier constraints
   * @param {Object} user - User record from the database
   * @param {string} action - Action identifier (e.g. 'ADD_HABIT')
   * @param {number} currentCount - Current count of items
   * @returns {boolean}
   */
  isLimitAllowed: (user, action, currentCount = 0) => {
    const isPremium = user?.isPremium || false;

    // If Stripe billing subscription integrations are turned off via Feature Flags, allow all
    if (!featureFlags.isEnabled('STRIPE_SUBSCRIPTIONS')) {
      return true;
    }

    if (isPremium) {
      return true; // Premium has unlimited permissions
    }

    // Free plan constraints
    const FREE_LIMITS = {
      ADD_DAILY_HABIT: 5,
      ADD_WEEKLY_HABIT: 3,
      ADD_MONTHLY_HABIT: 3,
    };

    const limit = FREE_LIMITS[action];
    if (limit === undefined) return true;

    return currentCount < limit;
  },

  getBillingDetails: async (user) => {
    return {
      isPremium: user?.isPremium || false,
      customerId: user?.stripeCustomerId || null,
      planName: user?.isPremium ? 'Premium Plan' : 'Free Plan',
    };
  }
};
