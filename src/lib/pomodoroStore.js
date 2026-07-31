export const pomodoroStore = {
  _getStore: () => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem('sysos_pomodoro');
    return data ? JSON.parse(data) : {};
  },
  
  _setStore: (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sysos_pomodoro', JSON.stringify(data));
    }
  },

  logSession: async (date, subject, minutes) => {
    const store = pomodoroStore._getStore();
    if (!store[date]) store[date] = [];
    store[date].push({ subject, minutes, timestamp: new Date().toISOString() });
    pomodoroStore._setStore(store);
    
    try {
      await fetch('/api/v1/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, subject, minutes })
      });
    } catch (e) {
      // background error ignore
    }
  },

  getSessions: (date) => {
    return pomodoroStore._getStore()[date] || [];
  },

  getTodaySessions: () => {
    const today = new Date().toISOString().split('T')[0];
    return pomodoroStore.getSessions(today);
  },

  getTotalMinutes: (days) => {
    const store = pomodoroStore._getStore();
    const today = new Date();
    let total = 0;
    
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const sessions = store[dateStr] || [];
      total += sessions.reduce((sum, s) => sum + s.minutes, 0);
    }
    return total;
  },

  getWeeklyMinutes: () => {
    const store = pomodoroStore._getStore();
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      if (d > new Date()) break;
      const dateStr = d.toISOString().split('T')[0];
      const sessions = store[dateStr] || [];
      total += sessions.reduce((sum, s) => sum + s.minutes, 0);
    }
    return total;
  },

  getSubjectBreakdown: (days) => {
    const store = pomodoroStore._getStore();
    const today = new Date();
    const breakdown = {};
    
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const sessions = store[dateStr] || [];
      sessions.forEach(s => {
        const subj = s.subject || 'Uncategorized';
        breakdown[subj] = (breakdown[subj] || 0) + s.minutes;
      });
    }
    return breakdown;
  },

  getSessionCount: (days) => {
    const store = pomodoroStore._getStore();
    const today = new Date();
    let count = 0;
    
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      count += (store[dateStr] || []).length;
    }
    return count;
  },

  clearToday: () => {
    const today = new Date().toISOString().split('T')[0];
    const store = pomodoroStore._getStore();
    delete store[today];
    pomodoroStore._setStore(store);
  }
};
