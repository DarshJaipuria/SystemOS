export const BADGE_DEFINITIONS = [
  { id: 'streak_3', name: 'Streak Starter', emoji: '🔥', description: 'Complete habits 3 days in a row', condition: (c) => c.streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', emoji: '💪', description: '7-day streak', condition: (c) => c.streak >= 7 },
  { id: 'streak_30', name: 'Streak Master', emoji: '🏆', description: '30-day streak', condition: (c) => c.streak >= 30 },
  { id: 'early_bird', name: 'Early Bird', emoji: '🌅', description: 'Log a habit before 8 AM', condition: (c) => c.loggedBefore8AM },
  { id: 'night_owl', name: 'Night Owl', emoji: '🦉', description: 'Log a habit after 10 PM', condition: (c) => c.loggedAfter10PM },
  { id: 'hydration_hero', name: 'Hydration Hero', emoji: '💧', description: 'Drink 8 glasses in a day', condition: (c) => c.waterGlasses >= 8 },
  { id: 'digital_detox', name: 'Digital Detox', emoji: '📵', description: 'Screen time under 2h', condition: (c) => c.screenTime !== undefined && c.screenTime < 2 },
  { id: 'focus_monarch', name: 'Focus Monarch', emoji: '👑', description: 'Complete 5 Pomodoros in a day', condition: (c) => c.pomodorosToday >= 5 },
  { id: 'exam_ready', name: 'Exam Ready', emoji: '📚', description: 'Study 6+ hours in a day', condition: (c) => c.studyHours >= 6 },
  { id: 'healthy_week', name: 'Healthy Week', emoji: '🌿', description: 'Health score 80+ for 7 days', condition: (c) => c.healthyWeek },
  { id: 'no_skip_week', name: 'No Skip Week', emoji: '✅', description: 'Complete all habits for 7 days', condition: (c) => c.noSkipWeek },
  { id: 'meditation_start', name: 'Zen Beginner', emoji: '🧘', description: 'First meditation session', condition: (c) => c.meditated },
  { id: 'fitness_starter', name: 'Fitness Starter', emoji: '🏃', description: 'Exercise 3 days in a row', condition: (c) => c.exercisedDays >= 3 },
  { id: 'level_5', name: 'Rising Star', emoji: '⭐', description: 'Reach Level 5', condition: (c) => c.level >= 5 },
  { id: 'level_10', name: 'Habit Champion', emoji: '🎖️', description: 'Reach Level 10', condition: (c) => c.level >= 10 }
];

const XP_THRESHOLDS = [0, 0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const getXpForLevel = (level) => {
  if (level <= 10) return XP_THRESHOLDS[level] || 0;
  return XP_THRESHOLDS[10] + (level - 10) * 800;
};

const getLevelForXp = (xp) => {
  let level = 1;
  while (xp >= getXpForLevel(level + 1)) {
    level++;
  }
  return level;
};

const LEVEL_TITLES = [
  'None', 'Seedling', 'Sprout', 'Beginner', 'Learner', 'Student',
  'Scholar', 'Achiever', 'Veteran', 'Expert', 'Champion'
];
const getLevelTitle = (level) => {
  if (level >= 11) return 'Legend';
  return LEVEL_TITLES[level] || 'Seedling';
};

const ALL_MISSIONS = [
  { id: 'm1', title: 'Complete 3 Pomodoros', xp: 20, coins: 5 },
  { id: 'm2', title: 'Drink 6 glasses of water', xp: 15, coins: 5 },
  { id: 'm3', title: 'Read for 30 minutes', xp: 20, coins: 5 },
  { id: 'm4', title: 'Exercise for 20 minutes', xp: 25, coins: 10 },
  { id: 'm5', title: 'Log all habits today', xp: 30, coins: 10 },
  { id: 'm6', title: 'Meditate for 5 minutes', xp: 15, coins: 5 },
  { id: 'm7', title: 'Screen time under 3h', xp: 25, coins: 10 },
  { id: 'm8', title: 'Sleep 8 hours', xp: 20, coins: 5 }
];

export const gamificationStore = {
  _getState: () => {
    if (typeof window === 'undefined') return { xp: 0, level: 1, coins: 0, badges: [], missions: [], lastReset: '' };
    const data = localStorage.getItem('sysos_gamification');
    return data ? JSON.parse(data) : { xp: 0, level: 1, coins: 0, badges: [], missions: [], lastReset: '' };
  },
  
  _setState: (state) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sysos_gamification', JSON.stringify(state));
    }
  },

  getState: () => {
    return gamificationStore._getState();
  },

  addXP: (amount, reason) => {
    const state = gamificationStore._getState();
    const newXP = state.xp + amount;
    const oldLevel = state.level;
    const newLevel = getLevelForXp(newXP);
    const leveledUp = newLevel > oldLevel;
    
    let coinsEarned = 0;
    if (leveledUp) {
      coinsEarned = (newLevel - oldLevel) * 10;
      state.coins += coinsEarned;
      state.level = newLevel;
    }
    state.xp = newXP;
    gamificationStore._setState(state);
    
    return { newXP, newLevel, leveledUp, coinsEarned };
  },

  addCoins: (amount) => {
    const state = gamificationStore._getState();
    state.coins += amount;
    gamificationStore._setState(state);
  },

  unlockBadge: (badgeId) => {
    const state = gamificationStore._getState();
    if (!state.badges.includes(badgeId)) {
      state.badges.push(badgeId);
      gamificationStore._setState(state);
      const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      return { isNew: true, badge };
    }
    return { isNew: false, badge: null };
  },

  checkAndUnlockBadges: (context) => {
    const state = gamificationStore._getState();
    const unlocked = [];
    
    for (const def of BADGE_DEFINITIONS) {
      if (!state.badges.includes(def.id) && def.condition(context)) {
        state.badges.push(def.id);
        unlocked.push(def);
      }
    }
    
    if (unlocked.length > 0) {
      gamificationStore._setState(state);
    }
    return unlocked;
  },

  getDailyMissions: () => {
    gamificationStore.resetDailyMissions();
    const state = gamificationStore._getState();
    return state.missions;
  },

  completeMission: (missionId) => {
    const state = gamificationStore._getState();
    const mission = state.missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      mission.completed = true;
      gamificationStore._setState(state);
      gamificationStore.addXP(mission.xp, 'Mission completed');
      gamificationStore.addCoins(mission.coins);
      return true;
    }
    return false;
  },

  resetDailyMissions: () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const state = gamificationStore._getState();
    
    if (state.lastReset !== todayDate) {
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      
      const shuffled = [...ALL_MISSIONS].sort((a, b) => {
        const hashA = (a.id.charCodeAt(1) * dayOfYear) % 100;
        const hashB = (b.id.charCodeAt(1) * dayOfYear) % 100;
        return hashA - hashB;
      });
      
      state.missions = shuffled.slice(0, 3).map(m => ({ ...m, completed: false }));
      state.lastReset = todayDate;
      gamificationStore._setState(state);
    }
  },

  getLevelInfo: () => {
    const state = gamificationStore._getState();
    const currentLevelXp = getXpForLevel(state.level);
    const nextLevelXp = getXpForLevel(state.level + 1);
    
    const xpIntoLevel = state.xp - currentLevelXp;
    const xpRequiredForNext = nextLevelXp - currentLevelXp;
    const progress = Math.max(0, Math.min(1, xpIntoLevel / xpRequiredForNext));
    
    return {
      level: state.level,
      xp: state.xp,
      xpForNext: nextLevelXp,
      xpProgress: progress,
      title: getLevelTitle(state.level)
    };
  }
};
