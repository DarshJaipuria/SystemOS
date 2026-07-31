/**
 * Calculates the longest consecutive streak of checked-off days for a habit.
 * Completion dates are strings in the format "YYYY-MM-DD".
 */
export function calculateLongestStreak(completionDates) {
  if (!completionDates || completionDates.length === 0) return 0;

  // De-duplicate, filter out invalid values, and sort dates in ascending order
  const uniqueDates = [...new Set(completionDates)]
    .filter(Boolean)
    .sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  for (const dateStr of uniqueDates) {
    // Parse date as UTC midnight to avoid local timezone offset shifts
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
      // If diffDays is 0, it means duplicate date, which we ignore
    }
    prevDate = currentDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return longestStreak;
}

/**
 * Calculates the current active streak ending today or yesterday.
 */
export function calculateCurrentStreak(completionDates) {
  if (!completionDates || completionDates.length === 0) return 0;

  const uniqueDates = [...new Set(completionDates)]
    .filter(Boolean)
    .sort();

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If today or yesterday is not in the list, the current streak is 0
  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    return 0;
  }

  // To calculate current streak, we can just trace backwards from the latest date in the sorted list
  let currentStreak = 0;
  let prevDate = null;
  
  // Sort in descending order to trace backward
  const sortedDesc = [...uniqueDates].reverse();
  
  // Start from the most recent completed date
  const latestCompletedStr = sortedDesc[0];
  
  // Ensure the latest completed date is either today or yesterday
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
      const diffTime = prevDate - currentDate; // prevDate is newer than currentDate in desc list
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
    prevDate = currentDate;
  }

  return currentStreak;
}
