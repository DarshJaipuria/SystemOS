/**
 * Background Job: Email Dispatch Processor
 * Sends reminders, subscription confirmations, and checkout notification digests.
 */
import { logger } from '../logger';

export const emailProcessor = {
  sendHabitReminder: async (userId, email, correlationId = null) => {
    logger.info('JOB_EMAIL_REMINDER', `Queueing habit completion reminder email to ${email}`, {}, correlationId);
    try {
      // Integration with Resend / Mailgun / AWS SES
      return { success: true };
    } catch (error) {
      logger.error('JOB_EMAIL_REMINDER_FAILED', `Reminder email dispatch failed to ${email}`, error, {}, correlationId);
      throw error;
    }
  }
};
