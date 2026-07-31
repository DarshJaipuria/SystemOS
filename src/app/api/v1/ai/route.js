// FILE: src/app/api/v1/ai/route.js
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = 'You are Aria, a warm and supportive student wellness coach. Keep responses under 100 words. Be encouraging. Never guilt or shame students. Use simple, friendly language.';

function getFallback(type, context) {
  const fallbacks = {
    motivation: [
      "You're doing great! Keep up the good work and remember to take short breaks.",
      "Every step counts. You've got this, stay positive and focused!",
      "Consistency is key. Great job on keeping your streak alive, keep pushing forward!",
    ],
    wellness: [
      "Remember to hydrate and get enough sleep tonight!",
      "A short walk can do wonders for your stress levels. Keep balancing work and rest.",
      "Make sure to rest your eyes from screens and take deep breaths.",
    ],
    weekly: [
      "What a week! Be proud of your progress and rest well for the upcoming days.",
      "You've shown great dedication this week. Keep reflecting and growing!",
      "Great week overall! Let's aim to maintain the good habits.",
    ],
    celebrate: [
      "Woohoo! Congratulations on your new achievement! You earned it.",
      "Amazing milestone! Take a moment to celebrate this success.",
      "Fantastic job unlocking that badge! Keep shining.",
    ],
    reflection: [
      "What is one thing you learned about yourself today?",
      "How did you overcome a challenge you faced recently?",
      "What made you smile today?",
    ],
    'habit-explain': [
      "Building this habit helps improve your focus and long-term well-being.",
      "This habit is great for maintaining energy levels throughout your study sessions.",
      "Consistently doing this builds discipline and reduces stress over time.",
    ]
  };

  const options = fallbacks[type] || fallbacks['motivation'];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

export async function POST(request) {
  try {
    const { type, context } = await request.json();

    let userPrompt = '';
    if (type === 'motivation') {
      userPrompt = `Student Health Score: ${context?.healthScore}/100. Current streak: ${context?.streak} days. Give one compliment and one actionable tip.`;
    } else if (type === 'wellness') {
      userPrompt = `Screen time: ${context?.screenTime}h, Sleep: ${context?.sleep}h, Water: ${context?.water} glasses, Stress: ${context?.stress}/10, Exercise: ${context?.exercise} min. Give 2 specific wellness improvements.`;
    } else if (type === 'weekly') {
      userPrompt = `Weekly summary. Avg score: ${context?.avgScore}, Trend: ${context?.trend}, Top Habit: ${context?.topHabit}. Summarize the week encouragingly.`;
    } else if (type === 'celebrate') {
      userPrompt = `Student just earned the "${context?.badgeName}" achievement at level ${context?.level}! Celebrate this milestone.`;
    } else if (type === 'reflection') {
      userPrompt = `Mood: ${context?.mood}, Streak: ${context?.streak}. Give a brief reflection question.`;
    } else if (type === 'habit-explain') {
      userPrompt = `Briefly explain why "${context?.habitName}" is beneficial for students.`;
    } else {
      userPrompt = 'Give a brief word of encouragement.';
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userPrompt}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3:4b',
          prompt: fullPrompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 150 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!ollamaRes.ok) {
        throw new Error('Ollama response not ok');
      }

      const data = await ollamaRes.json();
      return NextResponse.json({ message: data.response, source: 'ollama' });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('Ollama request failed or timed out. Using fallback.', fetchError);
      return NextResponse.json({ message: getFallback(type, context), source: 'fallback' });
    }

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
