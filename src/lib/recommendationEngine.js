export const recommendationEngine = {
  getRecommendations: (wellnessLog, existingHabitNames = []) => {
    if (!wellnessLog) return [];
    
    const names = existingHabitNames.map(n => n.toLowerCase());
    const hasHabit = (name) => names.includes(name.toLowerCase());
    
    const rules = [];
    
    if (wellnessLog.screenTime > 6 && !hasHabit('📵 No Phone After 10 PM')) {
      rules.push({
        id: 'rec_screentime',
        title: '📵 No Phone After 10 PM',
        emoji: '📵',
        category: 'wellness',
        reason: 'Your screen time is high. Reducing evening phone use improves sleep quality.',
        priority: 'high',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.sleep || 0) < 6 && !hasHabit('😴 Sleep Before 11 PM')) {
      rules.push({
        id: 'rec_sleep_low',
        title: '😴 Sleep Before 11 PM',
        emoji: '😴',
        category: 'wellness',
        reason: "You averaged less than 6 hours. Sleep is your brain's reset button.",
        priority: 'high',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.sleep || 0) >= 6 && (wellnessLog.sleep || 0) < 7 && !hasHabit('🌙 Wind Down Routine')) {
      rules.push({
        id: 'rec_sleep_med',
        title: '🌙 Wind Down Routine',
        emoji: '🌙',
        category: 'wellness',
        reason: 'Getting to 7-8 hours can improve your focus score significantly.',
        priority: 'medium',
        action: 'add_habit'
      });
    }
    
    const exercise = wellnessLog.exerciseMinutes || wellnessLog.exercise || 0;
    if (exercise < 15 && !hasHabit('🏃 20 Minute Walk')) {
      rules.push({
        id: 'rec_exercise_low',
        title: '🏃 20 Minute Walk',
        emoji: '🏃',
        category: 'fitness',
        reason: 'Even a short walk boosts mood and memory retention.',
        priority: 'high',
        action: 'add_habit'
      });
    } else if (exercise < 30 && !hasHabit('💪 Evening Stretch')) {
      rules.push({
        id: 'rec_exercise_med',
        title: '💪 Evening Stretch',
        emoji: '💪',
        category: 'fitness',
        reason: 'Light stretching improves sleep quality.',
        priority: 'low',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.water || 0) < 4 && !hasHabit('💧 Drink Water Every 2 Hours')) {
      rules.push({
        id: 'rec_water',
        title: '💧 Drink Water Every 2 Hours',
        emoji: '💧',
        category: 'wellness',
        reason: 'Dehydration reduces focus by up to 20%.',
        priority: 'high',
        action: 'add_habit'
      });
    }
    
    const meditation = wellnessLog.meditationMinutes || wellnessLog.meditation || 0;
    if ((wellnessLog.stress || 0) > 7 && meditation === 0 && !hasHabit('🧘 5 Min Deep Breathing')) {
      rules.push({
        id: 'rec_stress',
        title: '🧘 5 Min Deep Breathing',
        emoji: '🧘',
        category: 'wellness',
        reason: 'High stress detected. 5 minutes of breathing can lower cortisol.',
        priority: 'high',
        action: 'add_habit'
      });
    } else if (meditation === 0 && !hasHabit('🧘 Try 5 Min Meditation')) {
      rules.push({
        id: 'rec_meditation_low',
        title: '🧘 Try 5 Min Meditation',
        emoji: '🧘',
        category: 'wellness',
        reason: 'Daily mindfulness reduces exam anxiety.',
        priority: 'low',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.studyHours || 0) < 2 && !hasHabit('📚 Pomodoro Study Block')) {
      rules.push({
        id: 'rec_study',
        title: '📚 Pomodoro Study Block',
        emoji: '📚',
        category: 'productivity',
        reason: 'Structured study sessions improve retention.',
        priority: 'medium',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.socialMedia || 0) > 3 && !hasHabit('📱 Social Media Break')) {
      rules.push({
        id: 'rec_social',
        title: '📱 Social Media Break',
        emoji: '📱',
        category: 'productivity',
        reason: 'Consider limiting social media to 2 hours.',
        priority: 'medium',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.gaming || 0) > 2 && !hasHabit('🎮 Gaming Time-Box')) {
      rules.push({
        id: 'rec_gaming',
        title: '🎮 Gaming Time-Box',
        emoji: '🎮',
        category: 'productivity',
        reason: 'Set a gaming timer to stay on track.',
        priority: 'low',
        action: 'add_habit'
      });
    }
    
    if ((wellnessLog.mood || 5) < 3 && !hasHabit('😊 Gratitude Journal')) {
      rules.push({
        id: 'rec_mood',
        title: '😊 Gratitude Journal',
        emoji: '😊',
        category: 'wellness',
        reason: 'Writing 3 gratitudes daily improves mood within 2 weeks.',
        priority: 'medium',
        action: 'add_habit'
      });
    }
    
    const prioScore = { 'high': 3, 'medium': 2, 'low': 1 };
    rules.sort((a, b) => prioScore[b.priority] - prioScore[a.priority]);
    
    return rules.slice(0, 5);
  }
};
