export const wellnessStore = {
  _getLogs: () => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem('sysos_wellness');
    return data ? JSON.parse(data) : {};
  },

  _setLogs: (logs) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sysos_wellness', JSON.stringify(logs));
    }
  },

  logWellness: async (date, data) => {
    const logs = wellnessStore._getLogs();
    logs[date] = { ...logs[date], ...data };
    wellnessStore._setLogs(logs);
    
    try {
      await fetch('/api/v1/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...data })
      });
    } catch (e) {
      // Background save error ignored
    }
    return logs[date];
  },

  getLog: (date) => {
    return wellnessStore._getLogs()[date] || null;
  },

  getRecentLogs: (days) => {
    const logs = wellnessStore._getLogs();
    const result = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (logs[dateStr]) {
        result.push({ date: dateStr, ...logs[dateStr] });
      }
    }
    return result;
  },

  calculateHealthScore: (log) => {
    let score = 0;
    
    // Sleep (25pts)
    const sleep = log.sleep || 0;
    if (sleep >= 7 && sleep <= 9) score += 25;
    else if (sleep > 9) score += 20;
    else if (sleep >= 6) score += 18;
    else if (sleep >= 5) score += 10;
    else score += 3;

    // Habit completion (20pts)
    const pct = log.habitCompletionPct || 0;
    score += pct * 0.2;

    // Screen time (15pts)
    const screen = log.screenTime || 0;
    if (screen < 2) score += 15;
    else if (screen <= 4) score += 10;
    else if (screen <= 6) score += 5;
    
    // Hydration (15pts)
    const water = log.water || 0;
    if (water >= 8) score += 15;
    else if (water >= 6) score += 11;
    else if (water >= 4) score += 7;
    else if (water >= 2) score += 3;
    
    // Exercise (10pts)
    const exercise = log.exerciseMinutes || log.exercise || 0;
    if (exercise >= 60) score += 10;
    else if (exercise >= 30) score += 7;
    else if (exercise >= 15) score += 4;
    
    // Study (10pts)
    const study = log.studyHours || 0;
    if (study >= 6) score += 10;
    else if (study >= 4) score += 7;
    else if (study >= 2) score += 4;
    
    // Mood (5pts)
    const mood = log.mood || 0;
    score += (mood / 5) * 5;
    
    // Stress (5pts)
    const stress = log.stress || 0;
    score += ((10 - stress) / 10) * 5;
    
    return Math.round(score);
  },

  calculateExamReadinessScore: (recentLogs, pomodoroMins, habitCompletionPct) => {
    if (!recentLogs || recentLogs.length === 0) return 0;
    
    let studyTotal = 0;
    let sleepArr = [];
    let screenTotal = 0;
    
    recentLogs.forEach(log => {
      studyTotal += log.studyHours || 0;
      sleepArr.push(log.sleep || 0);
      screenTotal += log.screenTime || 0;
    });
    
    const days = recentLogs.length;
    const avgStudy = studyTotal / days;
    const avgScreen = screenTotal / days;
    const avgSleep = sleepArr.reduce((a,b)=>a+b,0) / days;
    
    let score = 0;
    
    // Study avg (35pts)
    score += Math.min(35, (avgStudy / 6) * 35);
    
    // Sleep std dev penalty (20pts max)
    const sleepVariance = sleepArr.reduce((sq, n) => sq + Math.pow(n - avgSleep, 2), 0) / days;
    const sleepStdDev = Math.sqrt(sleepVariance);
    score += Math.max(0, 20 - sleepStdDev * 5);
    
    // Screen avg (20pts)
    if (avgScreen < 2) score += 20;
    else if (avgScreen < 4) score += 15;
    else if (avgScreen < 6) score += 10;
    else if (avgScreen < 8) score += 5;
    
    // Pomodoro (15pts)
    const pomodoroSessions = pomodoroMins / 25;
    score += Math.min(15, (pomodoroSessions / 10) * 15);
    
    // Habit (10pts)
    score += (habitCompletionPct || 0) * 0.1;
    
    return Math.round(score);
  },

  calculateExamReadiness: (recentLogs, pomodoroMins = 0, habitCompletionPct = 0) => {
    return wellnessStore.calculateExamReadinessScore(recentLogs, pomodoroMins, habitCompletionPct);
  },

  getTrend: (days) => {
    const logs = wellnessStore.getRecentLogs(days);
    return logs.map(log => ({
      date: log.date,
      score: wellnessStore.calculateHealthScore(log)
    }));
  },

  getInsights: (logs) => {
    if (!logs || logs.length < 3) return ["Log more data to get personalized insights!"];
    
    const insights = [];
    
    const sleepAvg = logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length;
    if (sleepAvg < 6) insights.push("You're consistently getting less than 6 hours of sleep. Try going to bed 30 mins earlier.");
    else if (sleepAvg >= 7) insights.push("Great job maintaining a healthy sleep schedule! Your brain loves this.");
    
    let improvedSleep = true;
    for (let i = 1; i < Math.min(3, logs.length); i++) {
       if ((logs[i].sleep || 0) <= (logs[i-1].sleep || 0)) improvedSleep = false;
    }
    if (improvedSleep && logs.length >= 3) insights.push("Your sleep improved this week! Keep the momentum going.");
    
    const waterAvg = logs.reduce((sum, log) => sum + (log.water || 0), 0) / logs.length;
    if (waterAvg < 4) insights.push("Hydration is a bit low. Water helps clear brain fog during study sessions.");
    
    let maxStudy = 0;
    let maxStudyDate = null;
    logs.forEach(log => {
      if ((log.studyHours || 0) > maxStudy) {
        maxStudy = log.studyHours;
        maxStudyDate = new Date(log.date).getDay();
      }
    });
    
    if (maxStudyDate !== null && maxStudy > 0) {
      const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
      insights.push(`You seem to study best on ${days[maxStudyDate]}. Plan your hardest subjects then!`);
    }

    if (insights.length === 0) {
      insights.push("You are maintaining a steady routine. Keep tracking to discover more patterns.");
      insights.push("Consistency is key! Every entry helps build a clearer picture of your wellness.");
    }
    
    return insights.slice(0, 5);
  }
};
