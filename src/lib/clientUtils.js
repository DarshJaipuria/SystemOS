/**
 * Client-side calculation utility functions
 */

export const clientUtils = {
  getDaysInMonth: (year, month) => {
    return new Date(year, month, 0).getDate();
  },

  calculateOverallProgress: (habits) => {
    let totalCompleted = 0;
    let totalGoals = 0;

    habits.forEach(habit => {
      totalCompleted += habit.completions?.length || 0;
      totalGoals += habit.goalDays || 30;
    });

    return totalGoals > 0 
      ? parseFloat(((totalCompleted / totalGoals) * 100).toFixed(1))
      : 0;
  },

  calculateLongestStreak: (completionDates) => {
    if (!completionDates || completionDates.length === 0) return 0;
    const uniqueDates = [...new Set(completionDates)].filter(Boolean).sort();

    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (const dateStr of uniqueDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const currentDate = new Date(Date.UTC(year, month - 1, day));

      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diffTime = currentDate - prevDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
      prevDate = currentDate;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return longestStreak;
  },

  calculateCurrentStreak: (completionDates) => {
    if (!completionDates || completionDates.length === 0) return 0;
    const uniqueDates = [...new Set(completionDates)].filter(Boolean).sort();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    let currentStreak = 0;
    let prevDate = null;
    const sortedDesc = [...uniqueDates].reverse();
    const latestCompletedStr = sortedDesc[0];
    
    if (latestCompletedStr !== todayStr && latestCompletedStr !== yesterdayStr) {
      return 0;
    }

    for (let i = 0; i < sortedDesc.length; i++) {
      const dateStr = sortedDesc[i];
      const [year, month, day] = dateStr.split('-').map(Number);
      const currentDate = new Date(Date.UTC(year, month - 1, day));

      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diffTime = prevDate - currentDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          break;
        }
      }
      prevDate = currentDate;
    }

    return currentStreak;
  },

  getUnlockedRewardsLimit: (completionsCount, totalDailyHabits, totalTemplatesCount = 5) => {
    if (totalDailyHabits === 0) return 0;
    const habitsPerReward = Math.max(1, Math.round(totalDailyHabits / 3));
    return Math.min(totalTemplatesCount, Math.floor(completionsCount / habitsPerReward));
  },

  getValidClaimedRewards: (claimedRewards, habits, totalDailyHabits, totalTemplatesCount) => {
    const valid = [];
    const claimsByDate = {};
    claimedRewards.forEach(c => {
      if (!claimsByDate[c.date]) claimsByDate[c.date] = [];
      claimsByDate[c.date].push(c);
    });

    Object.keys(claimsByDate).forEach(dateStr => {
      const completionsCount = habits.filter(h => 
        h.completions?.some(c => c.date === dateStr)
      ).length;
      const unlocked = clientUtils.getUnlockedRewardsLimit(completionsCount, totalDailyHabits, totalTemplatesCount);
      const dayClaims = claimsByDate[dateStr];
      valid.push(...dayClaims.slice(0, unlocked));
    });

    return valid;
  },

  getWeeklyChecklistPercent: (weeklyHabits) => {
    if (weeklyHabits.length === 0) return 0;
    const completedCount = weeklyHabits.filter(w => w.completed).length;
    return Math.round((completedCount / weeklyHabits.length) * 100);
  },

  getMonthlyChecklistPercent: (monthlyHabits) => {
    if (monthlyHabits.length === 0) return 0;
    const completedCount = monthlyHabits.filter(w => w.completed).length;
    return Math.round((completedCount / monthlyHabits.length) * 100);
  }
};
