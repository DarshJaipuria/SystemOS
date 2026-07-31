export const MOCK_PEERS = [
  { id: 'p1', name: 'Aarav', avatar: '🧑💻', level: 12, xp: 3500, streak: 45, habitsDone: 5, wellnessScore: 92, status: 'online', lastActive: 'Just now' },
  { id: 'p2', name: 'Riya', avatar: '👩🎓', level: 8, xp: 1950, streak: 12, habitsDone: 3, wellnessScore: 85, status: 'away', lastActive: '10 mins ago' },
  { id: 'p3', name: 'Arjun', avatar: '🧑🔬', level: 5, xp: 850, streak: 5, habitsDone: 2, wellnessScore: 78, status: 'online', lastActive: '2 mins ago' },
  { id: 'p4', name: 'Ananya', avatar: '👩🏫', level: 15, xp: 5800, streak: 30, habitsDone: 6, wellnessScore: 88, status: 'offline', lastActive: '2 hours ago' },
  { id: 'p5', name: 'Kabir', avatar: '🧑🎨', level: 3, xp: 400, streak: 2, habitsDone: 1, wellnessScore: 65, status: 'online', lastActive: 'Just now' },
  { id: 'p6', name: 'Priya', avatar: '👩💻', level: 10, xp: 3300, streak: 21, habitsDone: 4, wellnessScore: 81, status: 'away', lastActive: '1 hour ago' },
  { id: 'p7', name: 'Dev', avatar: '🧑🎓', level: 6, xp: 1100, streak: 7, habitsDone: 3, wellnessScore: 72, status: 'offline', lastActive: 'Yesterday' },
  { id: 'p8', name: 'Zara', avatar: '👩🔬', level: 9, xp: 2600, streak: 15, habitsDone: 4, wellnessScore: 89, status: 'online', lastActive: '5 mins ago' }
];

export const COMMUNITY_FEED = [
  { id: 'f1', peerId: 'p1', peerName: 'Aarav', peerAvatar: '🧑💻', type: 'completed', detail: 'Morning Run', timeAgo: '2 min ago', emoji: '🏃' },
  { id: 'f2', peerId: 'p2', peerName: 'Riya', peerAvatar: '👩🎓', type: 'badge', detail: 'Hydration Hero', timeAgo: '15 min ago', emoji: '💧' },
  { id: 'f3', peerId: 'p4', peerName: 'Ananya', peerAvatar: '👩🏫', type: 'streak', detail: '30-day streak', timeAgo: '1 hour ago', emoji: '🔥' },
  { id: 'f4', peerId: 'p3', peerName: 'Arjun', peerAvatar: '🧑🔬', type: 'level', detail: 'Level 5', timeAgo: '2 hours ago', emoji: '⭐' },
  { id: 'f5', peerId: 'p6', peerName: 'Priya', peerAvatar: '👩💻', type: 'completed', detail: 'Read 20 Pages', timeAgo: '3 hours ago', emoji: '📚' },
  { id: 'f6', peerId: 'p8', peerName: 'Zara', peerAvatar: '👩🔬', type: 'completed', detail: 'Study 2 Hours', timeAgo: '4 hours ago', emoji: '✏️' },
  { id: 'f7', peerId: 'p1', peerName: 'Aarav', peerAvatar: '🧑💻', type: 'badge', detail: 'Early Bird', timeAgo: 'Yesterday', emoji: '🌅' },
  { id: 'f8', peerId: 'p7', peerName: 'Dev', peerAvatar: '🧑🎓', type: 'completed', detail: 'No Social Media', timeAgo: 'Yesterday', emoji: '📵' },
  ...Array.from({ length: 17 }).map((_, i) => ({
    id: `f${i+9}`, peerId: 'p5', peerName: 'Kabir', peerAvatar: '🧑🎨', type: 'completed', detail: 'Morning Routine', timeAgo: 'Yesterday', emoji: '🌅'
  }))
];

export const HABIT_TEMPLATES = {
  'Student Starter': { emoji: '📚', habits: ['Morning Review', 'Read 20 Pages', 'No Social Media Before Noon', 'Evening Reflection', 'Sleep Before 11 PM'] },
  'Board Exam Prep': { emoji: '✏️', habits: ['6 Hours Study', 'Mock Test Daily', 'Revision Notes', 'No Gaming on Weekdays', 'Sleep 7 Hours'] },
  'JEE Aspirant': { emoji: '⚛️', habits: ['Physics Practice', 'Math Problems', 'Chemistry Revision', 'Previous Year Questions', 'Concept Mapping', 'No Social Media', 'Sleep 7 Hours'] },
  'NEET Aspirant': { emoji: '🏥', habits: ['Biology Diagrams', 'Chemistry Practice', 'Physics Numericals', 'NCERT Revision', 'Mock Test', 'Sleep 7 Hours'] },
  'Healthy Lifestyle': { emoji: '🌿', habits: ['Drink 8 Glasses Water', 'Walk 20 Minutes', 'Eat Vegetables', 'Sleep 8 Hours', 'No Junk Food', 'Morning Stretch'] },
  'Fitness Beginner': { emoji: '💪', habits: ['Morning Walk 20 Min', 'Push-Ups 10 Reps', 'Skipping 5 Minutes', 'Drink Water 8 Glasses', 'Sleep Before 11 PM'] },
  'Digital Detox': { emoji: '📵', habits: ['No Phone Before 8 AM', 'No Social Media After 9 PM', 'Screen Time Under 3 Hours', 'Phone-Free Meals', 'No Phone In Bedroom'] },
  'Morning Routine': { emoji: '🌅', habits: ['Wake Up at 6 AM', 'Drink Water First', 'Morning Exercise', 'Journaling', 'No Phone First Hour'] },
  'Night Routine': { emoji: '🌙', habits: ['No Screens After 9 PM', 'Read Before Sleep', 'Journal Gratitude', 'Sleep Before 11 PM', '5 Min Breathing'] },
  'Mindfulness': { emoji: '🧘', habits: ['10 Min Meditation', 'Gratitude Journal', 'Deep Breathing', 'Digital Detox Hour', 'Nature Walk'] }
};

export const generateDemoHabits = () => {
  const habits = [
    { name: 'No Social Media Before Noon', prob: 0.7, goalDays: 30 },
    { name: 'Read 20 Pages', prob: 0.8, goalDays: 30 },
    { name: 'Morning Review', prob: 0.95, goalDays: 31 },
    { name: 'Sleep Before 11 PM', prob: 0.65, goalDays: 30 },
    { name: 'Morning Exercise', prob: 0.75, goalDays: 30 },
    { name: 'Read 30 Pages', prob: 0.7, goalDays: 30 },
    { name: 'Drink 8 Glasses Water', prob: 0.85, goalDays: 30 },
    { name: 'No Social Media After 9 PM', prob: 0.6, goalDays: 30 },
    { name: 'Study 2 Hours', prob: 0.85, goalDays: 30 },
    { name: 'Meditate 10 Minutes', prob: 0.55, goalDays: 30 }
  ];
  
  const today = new Date();
  
  return habits.map((h, i) => {
    const completions = [];
    for (let d = 0; d < 60; d++) {
      if (Math.random() < h.prob || (h.name === 'Morning Review' && d < 31)) {
        const date = new Date(today);
        date.setDate(today.getDate() - d);
        completions.push({ date: date.toISOString().split('T')[0] });
      }
    }
    return {
      id: 'demo_' + (i + 1),
      name: h.name,
      completions,
      goalDays: h.goalDays
    };
  });
};

export const generateDemoWellnessLogs = () => {
  const logs = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    logs.push({
      date: d.toISOString().split('T')[0],
      sleep: 5 + Math.floor(Math.random() * 4),
      screenTime: 2 + Math.floor(Math.random() * 5),
      water: 3 + Math.floor(Math.random() * 6),
      stress: 2 + Math.floor(Math.random() * 6),
      exercise: Math.floor(Math.random() * 60),
      studyHours: 1 + Math.floor(Math.random() * 6),
      mood: 2 + Math.floor(Math.random() * 3),
      habitCompletionPct: 40 + Math.floor(Math.random() * 60)
    });
  }
  return logs;
};

export const generateDemoPomodoros = () => {
  const sessions = [];
  const today = new Date();
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'History'];
  
  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - Math.floor(Math.random() * 14));
    sessions.push({
      date: d.toISOString().split('T')[0],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      minutes: 25,
      timestamp: d.toISOString()
    });
  }
  return sessions;
};

export const generateDemoGamification = () => {
  return {
    xp: 2840,
    level: 12,
    coins: 340,
    badges: ['streak_3', 'streak_7', 'early_bird', 'hydration_hero', 'healthy_week', 'level_5', 'level_10', 'focus_monarch'],
    missions: [],
    lastReset: ''
  };
};
