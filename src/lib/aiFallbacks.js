export const aiFallbacks = {
  getMotivation: (healthScore, streak) => {
    if (streak > 7) return "You're on fire! Your streak is incredible. Keep up the amazing work!";
    if (healthScore >= 80) return "Your health score is fantastic! You're balancing everything perfectly. Stay awesome!";
    if (healthScore < 50) return "Remember, every small step counts. Be kind to yourself and take it one day at a time. You've got this.";
    return "You're doing great! Keep building those positive habits. Progress is progress, no matter how small.";
  },
  getWellnessAdvice: (log) => {
    const metrics = [
      { name: 'screenTime', val: log.screenTime || 0, worst: (v) => v > 4 },
      { name: 'sleep', val: log.sleep || 0, worst: (v) => v < 6 },
      { name: 'water', val: log.water || 0, worst: (v) => v < 4 },
      { name: 'stress', val: log.stress || 0, worst: (v) => v > 7 },
      { name: 'exercise', val: log.exercise || 0, worst: (v) => v < 15 }
    ];
    let worst = null;
    let worstScore = -1;
    for (const m of metrics) {
       if (m.name === 'screenTime' && m.val > 4) { if(m.val > worstScore) { worst = 'screenTime'; worstScore = m.val; }}
       if (m.name === 'sleep' && m.val < 6) { const diff = 6 - m.val; if(diff > worstScore) { worst = 'sleep'; worstScore = diff; }}
       if (m.name === 'water' && m.val < 4) { const diff = 4 - m.val; if(diff > worstScore) { worst = 'water'; worstScore = diff; }}
       if (m.name === 'stress' && m.val > 7) { if(m.val > worstScore) { worst = 'stress'; worstScore = m.val; }}
       if (m.name === 'exercise' && m.val < 15) { const diff = 15 - m.val; if(diff > worstScore) { worst = 'exercise'; worstScore = diff; }}
    }
    
    if (worst === 'sleep') return "Sleep is super important for your brain. Try to wind down 30 minutes earlier tonight.";
    if (worst === 'water') return "Hydration helps with focus! Try keeping a water bottle nearby today.";
    if (worst === 'stress') return "School can be stressful. Take a 5-minute breathing break, it really helps reset your mind.";
    if (worst === 'screenTime') return "Digital fatigue is real. Consider taking a break from screens an hour before bed.";
    if (worst === 'exercise') return "Even a short 15-minute walk can boost your mood and energy for studying.";
    return "You're keeping a good balance! Keep prioritizing your wellness along with your studies.";
  },
  getWeeklySummary: (avgScore, trend) => {
    if (avgScore >= 80 && trend === 'up') return "Outstanding week! You improved your score and maintained great habits. Keep shining!";
    if (avgScore >= 80) return "Excellent week! You consistently made healthy choices. Take a moment to celebrate!";
    if (trend === 'up') return "You made great progress this week! Your positive trend shows your effort is paying off.";
    if (avgScore < 60) return "This week had its challenges, and that's okay. Next week is a fresh start to try again.";
    return "A solid week of effort. Keep fine-tuning your routine and building those good habits!";
  },
  celebrateAchievement: (badgeName) => {
    if (badgeName.toLowerCase().includes('streak')) return `Wow, a streak badge for ${badgeName}! Your consistency is paying off. So proud of you!`;
    if (badgeName.toLowerCase().includes('level')) return `Congratulations on reaching ${badgeName}! You are leveling up in real life too!`;
    if (badgeName.toLowerCase().includes('hero')) return `Amazing job earning ${badgeName}! You're making choices that your future self will thank you for.`;
    return `Woohoo! You earned the ${badgeName} badge. Keep up the fantastic effort!`;
  },
  getReflectionPrompt: (mood) => {
    if (mood >= 4) return "You seem to be in a great mood! What was the highlight of your day?";
    if (mood === 3) return "An okay day is still a good day. What's one small thing that made you smile today?";
    if (mood <= 2) return "I see today was tough. What's one thing you can do right now to show yourself some kindness?";
    return "Reflect on today: what did you learn, and what can you improve tomorrow?";
  },
  getHabitExplanation: (habitName) => {
    if (habitName.toLowerCase().includes('sleep')) return "Quality sleep consolidates memory and improves problem-solving skills for your studies.";
    if (habitName.toLowerCase().includes('water')) return "Staying hydrated prevents fatigue and keeps your concentration sharp.";
    if (habitName.toLowerCase().includes('read') || habitName.toLowerCase().includes('study')) return "Consistent, focused study sessions build long-term knowledge retention.";
    if (habitName.toLowerCase().includes('exercise')) return "Physical activity increases blood flow to the brain, enhancing mood and cognition.";
    return "Building this habit will strengthen your discipline and improve your daily routine.";
  }
};
