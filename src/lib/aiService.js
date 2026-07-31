import { aiFallbacks } from './aiFallbacks';

export const aiService = {
  OLLAMA_BASE: 'http://localhost:11434',
  MODEL: 'qwen3:4b',
  TIMEOUT_MS: 4000,
  
  _callOllama: async (prompt, systemPrompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), aiService.TIMEOUT_MS);
    
    try {
      const response = await fetch(`${aiService.OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiService.MODEL,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }
      const data = await response.json();
      return data.response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  },

  getDailyMotivation: async (healthScore, streak) => {
    const system = 'You are a supportive student wellness coach named Aria. Keep responses under 100 words. Be warm and encouraging. Never guilt the student. Use simple language. Focus on practical, achievable advice.';
    const prompt = `The student has a health score of ${healthScore} and a habit streak of ${streak} days. Give them a short, encouraging motivational message.`;
    
    try {
      return await aiService._callOllama(prompt, system);
    } catch (e) {
      return aiFallbacks.getMotivation(healthScore, streak);
    }
  },

  getWellnessAdvice: async (wellnessLog) => {
    const system = 'You are a supportive student wellness coach named Aria. Keep responses under 100 words. Be warm and encouraging. Never guilt the student. Use simple language. Focus on practical, achievable advice.';
    const prompt = `The student logged this today: sleep ${wellnessLog.sleep || 0}h, screen time ${wellnessLog.screenTime || 0}h, water ${wellnessLog.water || 0} glasses, stress ${wellnessLog.stress || 0}/10, exercise ${wellnessLog.exercise || 0} min. Give brief wellness advice based on their weakest metric.`;
    
    try {
      return await aiService._callOllama(prompt, system);
    } catch (e) {
      return aiFallbacks.getWellnessAdvice(wellnessLog);
    }
  },

  getWeeklySummary: async (weekStats) => {
    const system = 'You are a supportive student wellness coach named Aria. Keep responses under 100 words. Be warm and encouraging. Never guilt the student. Use simple language. Focus on practical, achievable advice.';
    const prompt = `The student's average health score this week is ${weekStats.avgScore} and the trend is ${weekStats.trend}. Give a weekly summary and encouragement.`;
    
    try {
      return await aiService._callOllama(prompt, system);
    } catch (e) {
      return aiFallbacks.getWeeklySummary(weekStats.avgScore, weekStats.trend);
    }
  },

  celebrateAchievement: async (badgeName) => {
    const system = 'You are a supportive student wellness coach named Aria. Keep responses under 100 words. Be warm and encouraging. Never guilt the student. Use simple language. Focus on practical, achievable advice.';
    const prompt = `The student just unlocked the "${badgeName}" badge! Congratulate them enthusiastically.`;
    
    try {
      return await aiService._callOllama(prompt, system);
    } catch (e) {
      return aiFallbacks.celebrateAchievement(badgeName);
    }
  },

  getReflectionPrompt: async (mood, streak) => {
    const system = 'You are a supportive student wellness coach named Aria. Keep responses under 100 words. Be warm and encouraging. Never guilt the student. Use simple language. Focus on practical, achievable advice.';
    const prompt = `The student rated their mood as ${mood} out of 5, and has a streak of ${streak} days. Give them one thoughtful reflection question.`;
    
    try {
      return await aiService._callOllama(prompt, system);
    } catch (e) {
      return aiFallbacks.getReflectionPrompt(mood);
    }
  },

  getHabitExplanation: async (habitName) => {
    const system = 'You are a supportive student wellness coach named Aria. Keep responses under 100 words. Be warm and encouraging. Never guilt the student. Use simple language. Focus on practical, achievable advice.';
    const prompt = `Explain briefly why the habit "${habitName}" is beneficial for a student's wellness or studies.`;
    
    try {
      return await aiService._callOllama(prompt, system);
    } catch (e) {
      return aiFallbacks.getHabitExplanation(habitName);
    }
  }
};
