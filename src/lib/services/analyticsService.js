/**
 * Analytics Domain Service
 */

export const analyticsService = {
  /**
   * Calculates overall daily habit progress percentage
   */
  calculateOverallProgress: (habits) => {
    let totalCompleted = 0;
    let totalGoals = 0;

    habits.forEach(habit => {
      totalCompleted += habit.completions.length;
      totalGoals += habit.goalDays;
    });

    return totalGoals > 0 
      ? parseFloat(((totalCompleted / totalGoals) * 100).toFixed(2))
      : 0;
  },

  /**
   * Calculates completion statistics for week ranges
   */
  calculateWeekStats: (habits, weekIndex, daysCount) => {
    const startDay = (weekIndex - 1) * 7 + 1;
    const endDay = Math.min(weekIndex * 7, daysCount);
    
    const totalChecksPossible = habits.length * (endDay - startDay + 1);
    let checksCompleted = 0;

    habits.forEach(habit => {
      habit.completions.forEach(c => {
        const dayNum = parseInt(c.date.split('-')[2]);
        if (dayNum >= startDay && dayNum <= endDay) {
          checksCompleted++;
        }
      });
    });

    const percent = totalChecksPossible > 0 
      ? Math.round((checksCompleted / totalChecksPossible) * 100) 
      : 0;

    return { percent, count: checksCompleted, total: totalChecksPossible };
  },

  /**
   * Computes completed percentage for weekly habits list
   */
  calculateWeeklyChecklistPercent: (weeklyHabits) => {
    if (weeklyHabits.length === 0) return 0;
    const completedCount = weeklyHabits.filter(w => w.completed).length;
    return Math.round((completedCount / weeklyHabits.length) * 100);
  },

  /**
   * Computes completed percentage for monthly habits list
   */
  calculateMonthlyChecklistPercent: (monthlyHabits) => {
    if (monthlyHabits.length === 0) return 0;
    const completedCount = monthlyHabits.filter(w => w.completed).length;
    return Math.round((completedCount / monthlyHabits.length) * 100);
  },

  /**
   * Prepares daily habit completions data for Recharts chart
   */
  getDailyCompletionsChartData: (habits, daysCount) => {
    const data = [];
    for (let day = 1; day <= daysCount; day++) {
      const dayStr = day.toString().padStart(2, '0');
      let count = 0;
      habits.forEach(habit => {
        if (habit.completions.some(c => parseInt(c.date.split('-')[2]) === day)) {
          count++;
        }
      });
      data.push({ day, completions: count });
    }
    return data;
  }
};
