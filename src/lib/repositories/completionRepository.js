/**
 * Completion Repository Layer
 */
import { db } from '../db.js';

export const completionRepository = {
  create: async (habitId, date) => {
    return db.completion.create({
      data: {
        habitId,
        date,
      },
    });
  },

  delete: async (habitId, date) => {
    return db.completion.delete({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
    });
  },

  findManyByHabitId: async (habitId) => {
    return db.completion.findMany({
      where: { habitId },
      orderBy: { date: 'asc' },
    });
  },
};
