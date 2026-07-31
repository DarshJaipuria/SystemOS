/**
 * Habit Repository Layer (Daily, Weekly, and Monthly Habits)
 */
import { db } from '../db.js';

export const habitRepository = {
  // Daily Habits
  findDailyById: async (id) => {
    return db.habit.findUnique({
      where: { id },
    });
  },

  findDailyByNameAndDate: async (userId, name, month, year) => {
    return db.habit.findUnique({
      where: {
        userId_name_month_year: { userId, name, month, year }
      }
    });
  },

  findManyDaily: async (userId, month, year) => {
    return db.habit.findMany({
      where: { userId, month, year },
      include: {
        completions: {
          select: {
            date: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  },

  countDaily: async (userId, month, year) => {
    return db.habit.count({
      where: { userId, month, year },
    });
  },

  createDaily: async (userId, name, goalDays, month, year, displayOrder) => {
    return db.habit.create({
      data: {
        userId,
        name,
        goalDays,
        month,
        year,
        displayOrder,
      },
    });
  },

  updateDaily: async (id, name, goalDays) => {
    return db.habit.update({
      where: { id },
      data: { name, goalDays },
    });
  },

  deleteDaily: async (id) => {
    return db.habit.delete({
      where: { id },
    });
  },

  // Weekly Habits
  findWeeklyById: async (id) => {
    return db.weeklyHabit.findUnique({
      where: { id },
    });
  },

  findManyWeekly: async (userId, month, year) => {
    return db.weeklyHabit.findMany({
      where: { userId, month, year },
      orderBy: { displayOrder: 'asc' },
    });
  },

  countWeekly: async (userId, month, year) => {
    return db.weeklyHabit.count({
      where: { userId, month, year },
    });
  },

  createWeekly: async (userId, name, month, year, weekIndex, displayOrder) => {
    return db.weeklyHabit.create({
      data: {
        userId,
        name,
        month,
        year,
        weekIndex,
        displayOrder,
      },
    });
  },

  updateWeekly: async (id, name, completed) => {
    return db.weeklyHabit.update({
      where: { id },
      data: { name, completed },
    });
  },

  deleteWeekly: async (id) => {
    return db.weeklyHabit.delete({
      where: { id },
    });
  },

  // Monthly Habits
  findMonthlyById: async (id) => {
    return db.monthlyHabit.findUnique({
      where: { id },
    });
  },

  findManyMonthly: async (userId, month, year) => {
    return db.monthlyHabit.findMany({
      where: { userId, month, year },
      orderBy: { displayOrder: 'asc' },
    });
  },

  countMonthly: async (userId, month, year) => {
    return db.monthlyHabit.count({
      where: { userId, month, year },
    });
  },

  createMonthly: async (userId, name, month, year, displayOrder) => {
    return db.monthlyHabit.create({
      data: {
        userId,
        name,
        month,
        year,
        displayOrder,
      },
    });
  },

  updateMonthly: async (id, name, completed) => {
    return db.monthlyHabit.update({
      where: { id },
      data: { name, completed },
    });
  },

  deleteMonthly: async (id) => {
    return db.monthlyHabit.delete({
      where: { id },
    });
  },

  // Transaction Rollover/Import
  importHabits: async (userId, prevMonth, prevYear, currentMonth, currentYear) => {
    return db.$transaction(async (tx) => {
      // 1. Fetch previous daily habits
      const prevDaily = await tx.habit.findMany({
        where: { userId, month: prevMonth, year: prevYear },
      });

      // 2. Fetch previous weekly habits
      const prevWeekly = await tx.weeklyHabit.findMany({
        where: { userId, month: prevMonth, year: prevYear },
      });

      // 3. Fetch previous monthly habits
      const prevMonthly = await tx.monthlyHabit.findMany({
        where: { userId, month: prevMonth, year: prevYear },
      });

      // 4. Fetch previous reflection/affirmation for reference
      const prevReflection = await tx.reflection.findUnique({
        where: { userId_month_year: { userId, month: prevMonth, year: prevYear } },
      });

      // 5. Clean current month's items
      await tx.habit.deleteMany({ where: { userId, month: currentMonth, year: currentYear } });
      await tx.weeklyHabit.deleteMany({ where: { userId, month: currentMonth, year: currentYear } });
      await tx.monthlyHabit.deleteMany({ where: { userId, month: currentMonth, year: currentYear } });

      // 6. Bulk create daily
      const newDaily = await Promise.all(
        prevDaily.map(h => tx.habit.create({
          data: {
            userId,
            name: h.name,
            goalDays: h.goalDays,
            month: currentMonth,
            year: currentYear,
            displayOrder: h.displayOrder,
          }
        }))
      );

      // 7. Bulk create weekly
      const newWeekly = await Promise.all(
        prevWeekly.map(w => tx.weeklyHabit.create({
          data: {
            userId,
            name: w.name,
            month: currentMonth,
            year: currentYear,
            weekIndex: w.weekIndex,
            displayOrder: w.displayOrder,
            completed: false, // Clear completions
          }
        }))
      );

      // 8. Bulk create monthly
      const newMonthly = await Promise.all(
        prevMonthly.map(m => tx.monthlyHabit.create({
          data: {
            userId,
            name: m.name,
            month: currentMonth,
            year: currentYear,
            displayOrder: m.displayOrder,
            completed: false, // Clear completions
          }
        }))
      );

      // 9. Carry forward reflection placeholder if exists
      let newReflection = null;
      if (prevReflection) {
        newReflection = await tx.reflection.upsert({
          where: { userId_month_year: { userId, month: currentMonth, year: currentYear } },
          create: {
            userId,
            month: currentMonth,
            year: currentYear,
            text: '',
            imageUrl: prevReflection.imageUrl,
            polaroidUrl: prevReflection.polaroidUrl,
            affirmation: prevReflection.affirmation,
          },
          update: {
            imageUrl: prevReflection.imageUrl,
            polaroidUrl: prevReflection.polaroidUrl,
            affirmation: prevReflection.affirmation,
          }
        });
      }

      return {
        habits: newDaily,
        weeklyHabits: newWeekly,
        monthlyHabits: newMonthly,
        reflection: newReflection,
      };
    });
  }
};
