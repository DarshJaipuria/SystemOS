/**
 * Habit Domain Service
 */
import { habitRepository } from '../repositories/habitRepository.js';
import { CONSTANTS } from '../constants.js';

export const habitService = {
  // Daily Habits
  getDailyHabits: async (userId, month, year) => {
    return habitRepository.findManyDaily(userId, month, year);
  },

  createDailyHabit: async (userId, name, goalDays, month, year) => {
    // 1. Enforce max daily habits limit
    const currentCount = await habitRepository.countDaily(userId, month, year);
    if (currentCount >= CONSTANTS.PLANNER_LIMITS.MAX_DAILY_HABITS) {
      throw new Error(`Maximum daily habits limit of ${CONSTANTS.PLANNER_LIMITS.MAX_DAILY_HABITS} reached for this month.`);
    }

    // 2. Check for duplicate names
    const existing = await habitRepository.findDailyByNameAndDate(userId, name, month, year);
    if (existing) {
      throw new Error('A habit with this name already exists in this month.');
    }

    return habitRepository.createDaily(userId, name, goalDays || CONSTANTS.DEFAULT_GOAL_DAYS, month, year, currentCount);
  },

  updateDailyHabit: async (userId, id, name, goalDays) => {
    const habit = await habitRepository.findDailyById(id);
    if (!habit || habit.userId !== userId) {
      throw new Error('Habit not found or unauthorized');
    }
    return habitRepository.updateDaily(id, name, goalDays);
  },

  deleteDailyHabit: async (userId, id) => {
    const habit = await habitRepository.findDailyById(id);
    if (!habit || habit.userId !== userId) {
      throw new Error('Habit not found or unauthorized');
    }
    return habitRepository.deleteDaily(id);
  },

  // Weekly Habits
  getWeeklyHabits: async (userId, month, year) => {
    return habitRepository.findManyWeekly(userId, month, year);
  },

  createWeeklyHabit: async (userId, name, month, year, weekIndex) => {
    const currentCount = await habitRepository.countWeekly(userId, month, year);
    if (currentCount >= CONSTANTS.PLANNER_LIMITS.MAX_WEEKLY_HABITS) {
      throw new Error(`Maximum weekly habits limit of ${CONSTANTS.PLANNER_LIMITS.MAX_WEEKLY_HABITS} reached.`);
    }

    return habitRepository.createWeekly(userId, name, month, year, weekIndex, currentCount);
  },

  updateWeeklyHabit: async (userId, id, name, completed) => {
    const habit = await habitRepository.findWeeklyById(id);
    if (!habit || habit.userId !== userId) {
      throw new Error('Weekly habit not found or unauthorized');
    }
    return habitRepository.updateWeekly(id, name, completed);
  },

  deleteWeeklyHabit: async (userId, id) => {
    const habit = await habitRepository.findWeeklyById(id);
    if (!habit || habit.userId !== userId) {
      throw new Error('Weekly habit not found or unauthorized');
    }
    return habitRepository.deleteWeekly(id);
  },

  // Monthly Habits
  getMonthlyHabits: async (userId, month, year) => {
    return habitRepository.findManyMonthly(userId, month, year);
  },

  createMonthlyHabit: async (userId, name, month, year) => {
    const currentCount = await habitRepository.countMonthly(userId, month, year);
    if (currentCount >= CONSTANTS.PLANNER_LIMITS.MAX_MONTHLY_HABITS) {
      throw new Error(`Maximum monthly habits limit of ${CONSTANTS.PLANNER_LIMITS.MAX_MONTHLY_HABITS} reached.`);
    }

    return habitRepository.createMonthly(userId, name, month, year, currentCount);
  },

  updateMonthlyHabit: async (userId, id, name, completed) => {
    const habit = await habitRepository.findMonthlyById(id);
    if (!habit || habit.userId !== userId) {
      throw new Error('Monthly habit not found or unauthorized');
    }
    return habitRepository.updateMonthly(id, name, completed);
  },

  deleteMonthlyHabit: async (userId, id) => {
    const habit = await habitRepository.findMonthlyById(id);
    if (!habit || habit.userId !== userId) {
      throw new Error('Monthly habit not found or unauthorized');
    }
    return habitRepository.deleteMonthly(id);
  },

  // Import/Rollover
  importPreviousMonthHabits: async (userId, prevMonth, prevYear, currentMonth, currentYear) => {
    return habitRepository.importHabits(userId, prevMonth, prevYear, currentMonth, currentYear);
  }
};
