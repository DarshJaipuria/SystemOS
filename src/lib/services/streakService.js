/**
 * Streak Calculation Domain Service
 */

export const streakService = {
  /**
   * Calculates the longest consecutive streak of checked-off days for a list of completion date strings.
   * @param {string[]} completionDates - Array of dates in "YYYY-MM-DD" format.
   * @returns {number}
   */
  calculateLongestStreak: (completionDates) => {
    if (!completionDates || completionDates.length === 0) return 0;

    const uniqueDates = [...new Set(completionDates)]
      .filter(Boolean)
      .sort();

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

  /**
   * Calculates the current active streak ending today or yesterday.
   * @param {string[]} completionDates - Array of dates in "YYYY-MM-DD" format.
   * @returns {number}
   */
  calculateCurrentStreak: (completionDates) => {
    if (!completionDates || completionDates.length === 0) return 0;

    const uniqueDates = [...new Set(completionDates)]
      .filter(Boolean)
      .sort();

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
  }
};
