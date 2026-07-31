/**
 * Lightweight Feature Flag Engine
 */
import { config } from './config.js';

const FLAGS = {
  PREMIUM_THEMES: false, // Under development
  REFLECTIONS_IMAGE_UPLOAD: false, // Planned upload support
  STRIPE_SUBSCRIPTIONS: false, // Payment gateways enabled flag
};

export const featureFlags = {
  /**
   * Check if a specific feature is enabled
   * @param {string} flagName - Name of the feature flag
   * @param {Object} context - Optional context parameters (e.g. user details)
   * @returns {boolean}
   */
  isEnabled: (flagName, context = {}) => {
    // Check if overridden in environment variables
    const envKey = `FEATURE_${flagName.toUpperCase()}`;
    if (process.env[envKey] !== undefined) {
      return process.env[envKey] === 'true';
    }

    // Default configuration value
    const defaultValue = FLAGS[flagName] ?? false;

    // Custom rollout logic can be added here (e.g. rollout for specific user IDs or premium status)
    if (flagName === 'PREMIUM_THEMES' && context?.user?.isPremium) {
      return true;
    }

    return defaultValue;
  },

  getAllFlags: (context = {}) => {
    const active = {};
    for (const key of Object.keys(FLAGS)) {
      active[key] = featureFlags.isEnabled(key, context);
    }
    return active;
  }
};
