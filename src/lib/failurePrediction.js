export const failurePrediction = {
  analyzeHabit: (habit, completions) => {
    if (!completions || completions.length === 0) return null;
    
    const today = new Date();
    const last14Days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last14Days.push(d.toISOString().split('T')[0]);
    }
    
    const completionSet = new Set(completions);
    
    // Check missing last 3 days
    let missedLast3 = true;
    for (let i = 0; i < 3; i++) {
      if (completionSet.has(last14Days[i])) {
        missedLast3 = false;
      }
    }
    if (missedLast3) {
      return {
        habitName: habit.name,
        riskLevel: 'HIGH',
        reason: 'Not completed in 3 days',
        suggestion: 'Start small today. Try doing it for just 2 minutes to get back on track.'
      };
    }
    
    // Check Mondays
    let mondaysMissed = 0;
    let mondaysTotal = 0;
    for (let i = 0; i < 14; i++) {
      const dateStr = last14Days[i];
      const dateObj = new Date(dateStr);
      if (dateObj.getDay() === 1) {
        mondaysTotal++;
        if (!completionSet.has(dateStr)) mondaysMissed++;
      }
    }
    if (mondaysTotal > 0 && mondaysMissed >= 2) {
      return {
        habitName: habit.name,
        riskLevel: 'HIGH',
        reason: 'You tend to miss this on Mondays',
        suggestion: 'Mondays are tough! Try setting a special reminder on Sunday night.'
      };
    }
    
    // Weekend drop-off
    let weekendCompleted = 0, weekendTotal = 0;
    let weekdayCompleted = 0, weekdayTotal = 0;
    for (let i = 0; i < 14; i++) {
      const dateStr = last14Days[i];
      const day = new Date(dateStr).getDay();
      const isWeekend = day === 0 || day === 6;
      const done = completionSet.has(dateStr);
      
      if (isWeekend) {
        weekendTotal++;
        if (done) weekendCompleted++;
      } else {
        weekdayTotal++;
        if (done) weekdayCompleted++;
      }
    }
    
    const weekendPct = weekendTotal ? weekendCompleted / weekendTotal : 1;
    const weekdayPct = weekdayTotal ? weekdayCompleted / weekdayTotal : 1;
    
    if (weekendPct < 0.3 && weekdayPct > 0.6) {
      return {
        habitName: habit.name,
        riskLevel: 'MEDIUM',
        reason: 'Weekend drop-off pattern',
        suggestion: 'Adjust your weekend schedule to make room for this habit.'
      };
    }
    
    // Overall last 7 days
    let last7Completed = 0;
    for (let i = 0; i < 7; i++) {
      if (completionSet.has(last14Days[i])) last7Completed++;
    }
    if (last7Completed / 7 < 0.4) {
      return {
        habitName: habit.name,
        riskLevel: 'MEDIUM',
        reason: 'Low completion this week',
        suggestion: 'Has your schedule changed? Try linking this to an existing daily routine.'
      };
    }
    
    return null;
  },
  
  analyzeAll: (habits) => {
    if (!habits) return [];
    
    const results = habits
      .map(h => failurePrediction.analyzeHabit(h, h.completions.map(c => typeof c === 'string' ? c : c.date)))
      .filter(r => r !== null);
      
    const score = { 'HIGH': 2, 'MEDIUM': 1 };
    return results.sort((a, b) => score[b.riskLevel] - score[a.riskLevel]);
  }
};
