/**
 * Reflection Repository Layer
 */
import { db } from '../db.js';

export const reflectionRepository = {
  findUnique: async (userId, month, year) => {
    return db.reflection.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });
  },

  upsert: async (userId, month, year, data) => {
    const defaultText = data.text ?? '';
    const updateData = { ...data };
    delete updateData.userId;
    delete updateData.month;
    delete updateData.year;

    return db.reflection.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: updateData,
      create: {
        userId,
        month,
        year,
        text: defaultText,
        ...updateData,
      },
    });
  },
};
