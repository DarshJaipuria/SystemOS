import { generateDemoHabits, generateDemoWellnessLogs, generateDemoPomodoros, generateDemoGamification } from './demoData';

export const demoMode = {
  isEnabled: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sysos_demo_mode') === 'true';
  },

  enable: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sysos_demo_mode', 'true');
      
      const wellnessLogs = generateDemoWellnessLogs();
      const wellnessDict = {};
      wellnessLogs.forEach(l => { wellnessDict[l.date] = l; });
      localStorage.setItem('sysos_wellness', JSON.stringify(wellnessDict));
      
      const pomodoros = generateDemoPomodoros();
      const pomoDict = {};
      pomodoros.forEach(p => {
        if (!pomoDict[p.date]) pomoDict[p.date] = [];
        pomoDict[p.date].push(p);
      });
      localStorage.setItem('sysos_pomodoro', JSON.stringify(pomoDict));
      
      localStorage.setItem('sysos_gamification', JSON.stringify(generateDemoGamification()));
      localStorage.setItem('sysos_habits', JSON.stringify(generateDemoHabits()));
      
      localStorage.setItem('sysos_social_challenges', JSON.stringify(['hydration_7', 'exam_blitz']));
      return true;
    }
    return false;
  },

  disable: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sysos_demo_mode');
      localStorage.removeItem('sysos_wellness');
      localStorage.removeItem('sysos_pomodoro');
      localStorage.removeItem('sysos_gamification');
      return true;
    }
    return false;
  },

  toggle: () => {
    if (demoMode.isEnabled()) {
      return demoMode.disable();
    } else {
      return demoMode.enable();
    }
  },

  getDemoHabits: () => {
    return generateDemoHabits();
  },

  getDemoGamification: () => {
    return generateDemoGamification();
  }
};
