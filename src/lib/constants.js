/**
 * Application Constants
 */
export const CONSTANTS = {
  JWT_COOKIE_NAME: 'auth_token',
  JWT_EXPIRATION_DAYS: 30,
  COOKIE_MAX_AGE: 30 * 24 * 60 * 60, // 30 Days in seconds
  BCRYPT_SALT_ROUNDS: 10,
  DEFAULT_GOAL_DAYS: 30,
  PLANNER_LIMITS: {
    MAX_DAILY_HABITS: 30,
    MAX_WEEKLY_HABITS: 15,
    MAX_MONTHLY_HABITS: 15,
    MAX_REWARDS: 10,
  },
};
