// FILE: src/components/Dashboard/DashboardTab.js
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { wellnessStore } from '@/lib/wellnessStore';
import { gamificationStore } from '@/lib/gamificationStore';
import { recommendationEngine } from '@/lib/recommendationEngine';
import { failurePrediction } from '@/lib/failurePrediction';
import { demoMode } from '@/lib/demoMode';
import { aiService } from '@/lib/aiService';
import { clientUtils } from '@/lib/clientUtils';
import { pomodoroStore } from '@/lib/pomodoroStore';
import ScoreRing from '@/components/shared/ScoreRing';
import SkeletonCard, { SkeletonText } from '@/components/shared/SkeletonCard';
import styles from '@/app/page.module.css';
import { TrendingUp, TrendingDown, CheckCircle, Circle, AlertTriangle, Zap, BookOpen, Target, Trophy } from 'lucide-react';

const DAILY_QUOTES = [
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future depends on what you do today.",
  "It always seems impossible until it's done.",
  "Your attitude, not your aptitude, will determine your altitude.",
  "The secret of getting ahead is getting started.",
  "Strive for progress, not perfection.",
  "Don't let what you cannot do interfere with what you can do.",
  "Fall seven times, stand up eight.",
  "You are never too old to set another goal or to dream a new dream.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "Start where you are. Use what you have. Do what you can.",
  "It does not matter how slowly you go as long as you do not stop."
];

export default function DashboardTab({ user, habits = [], weeklyHabits = [], monthlyHabits = [], selectedMonth, selectedYear, handleToggleCompletion, theme }) {
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [healthScore, setHealthScore] = useState(0);
  const [examReadiness, setExamReadiness] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayCompletionPct, setTodayCompletionPct] = useState(0);
  const [atRiskHabits, setAtRiskHabits] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentBadges, setRecentBadges] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [dailyMissions, setDailyMissions] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  const getHabitDates = (h) => {
    if (!h) return [];
    const dates = [];
    if (Array.isArray(h.completions)) {
      h.completions.forEach(c => {
        if (typeof c === 'string') dates.push(c);
        else if (c && c.date) dates.push(c.date);
      });
    }
    if (Array.isArray(h.completedDays)) {
      h.completedDays.forEach(d => {
        if (typeof d === 'string') dates.push(d);
        else if (d && d.date) dates.push(d.date);
      });
    }
    if (Array.isArray(h.history)) {
      h.history.forEach(d => {
        if (typeof d === 'string') dates.push(d);
        else if (d && d.date) dates.push(d.date);
      });
    }
    return [...new Set(dates)];
  };

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      
      let wStore = wellnessStore;
      let gStore = gamificationStore;
      let rEngine = recommendationEngine;
      let fPredict = failurePrediction;
      let pStore = pomodoroStore;
      let ai = aiService;
      let cUtils = clientUtils;
      
      const todayLog = wStore?.getLog ? wStore.getLog(today) : null;
      const recentLogs = wStore?.getRecentLogs ? wStore.getRecentLogs(7) : [];
      const hScore = todayLog && wStore?.calculateHealthScore ? wStore.calculateHealthScore(todayLog) : 0;
      
      const pomodoroMins = pStore?.getWeeklyMinutes ? pStore.getWeeklyMinutes() : 0;
      const eReadiness = wStore?.calculateExamReadinessScore ? wStore.calculateExamReadinessScore(recentLogs, pomodoroMins, 50) : 0;
      
      const allCompletionDates = habits.reduce((acc, h) => acc.concat(getHabitDates(h)), []);
      const streak = cUtils?.calculateCurrentStreak ? cUtils.calculateCurrentStreak(allCompletionDates) : 0;
      
      const todayHabits = habits.filter(h => getHabitDates(h).includes(today));
      const completionPct = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;

      const risk = fPredict?.analyzeAll ? fPredict.analyzeAll(habits) : [];
      const recos = rEngine?.getRecommendations ? rEngine.getRecommendations(todayLog, habits.map(h => h.name)) : [];
      
      const gamestate = gStore?.getState ? gStore.getState() : { badges: [] };
      const unlockedBadges = gamestate.badges ? gamestate.badges.filter(b => b.unlockedAt).sort((a,b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)).slice(0,3) : [];
      
      const missions = gStore?.getDailyMissions ? gStore.getDailyMissions() : [];

      if (mounted) {
        setHealthScore(hScore);
        setExamReadiness(eReadiness);
        setCurrentStreak(streak);
        setTodayCompletionPct(completionPct);
        setAtRiskHabits(risk);
        setRecommendations(recos.slice(0, 3));
        setRecentBadges(unlockedBadges);
        setDailyMissions(missions);
        setActivityTimeline(todayHabits.slice(-5).map(h => ({ time: 'Today', name: h.name, xp: 10 })));
      }

      if (ai?.getDailyMotivation && mounted) {
        try {
          const msg = await ai.getDailyMotivation(hScore, streak);
          if (mounted) setAiMessage(msg);
        } catch (e) {
          if (mounted) setAiMessage("Keep pushing forward! Every small step counts.");
        }
      } else if (mounted) {
        setAiMessage("You've got this! Stay focused and keep building those habits.");
      }
      
      if (mounted) setLoading(false);
    }

    loadData();

    return () => { mounted = false; };
  }, [habits, today]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const toggleHabit = (habitId, date) => {
    const targetHabit = habits.find(h => h.id === habitId);
    const dates = getHabitDates(targetHabit);
    const isCurrentlyDone = dates.includes(date);
    if (handleToggleCompletion) handleToggleCompletion(habitId, date, !isCurrentlyDone);
    if (!isCurrentlyDone) {
      const event = new CustomEvent('triggerConfetti');
      window.dispatchEvent(event);
    }
  };

  const completeMission = (id) => {
    if (gamificationStore?.completeMission) {
      gamificationStore.completeMission(id);
      setDailyMissions(gamificationStore.getDailyMissions());
    }
  };

  if (loading) {
    return (
      <div className={styles.tabShell}>
        <div className={styles.dashGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className={styles.dashMain} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <SkeletonCard height="300px" />
          <SkeletonCard height="300px" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="greetingCard" style={{ padding: '24px', borderRadius: '16px', background: 'var(--glass-bg, rgba(255,255,255,0.7))', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border, rgba(255,255,255,0.3))' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>
          {greeting}, {user?.name || 'Student'}! 👋
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #475569)', marginBottom: '12px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-muted, #94a3b8)' }}>
          "{quote}"
        </div>
      </div>

      <div className="dashGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary, #475569)' }}>Health Score</h3>
          {healthScore > 0 ? (
            <ScoreRing score={healthScore} size={80} showValue={true} />
          ) : (
            <p style={{ color: 'var(--text-muted, #94a3b8)', textAlign: 'center', fontSize: '12px' }}>Log today's wellness to see score</p>
          )}
        </div>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary, #475569)' }}>Exam Readiness</h3>
          {examReadiness > 0 ? (
            <ScoreRing score={examReadiness} size={80} showValue={true} />
          ) : (
            <p style={{ color: 'var(--text-muted, #94a3b8)', textAlign: 'center', fontSize: '12px' }}>More data needed</p>
          )}
        </div>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary, #475569)' }}>Current Streak</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '32px' }}>🔥</span>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)' }}>{currentStreak}</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginTop: '8px' }}>days</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary, #475569)' }}>Today's Progress</h3>
          <ScoreRing score={todayCompletionPct} size={80} showValue={true} label="%" />
        </div>
      </div>

      <div className="dashMain" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card ai-message" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--accent-primary, #6366f1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={20} color="var(--accent-primary, #6366f1)" />
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>AI Daily Motivation</h3>
            </div>
            {aiMessage ? (
              <p style={{ margin: 0, color: 'var(--text-secondary, #475569)', lineHeight: '1.5' }}>{aiMessage}</p>
            ) : (
              <SkeletonText lines={2} />
            )}
          </div>

          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary, #0f172a)' }}>Today's Habits Quick List</h3>
            {habits.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #94a3b8)' }}>No habits added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {habits.map(habit => {
                  const habitDates = getHabitDates(habit);
                  const isDone = habitDates.includes(today);
                  const habitStreak = clientUtils?.calculateCurrentStreak ? clientUtils.calculateCurrentStreak(habitDates) : 0;
                  return (
                    <div key={habit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div onClick={() => toggleHabit(habit.id, today)} style={{ cursor: 'pointer' }}>
                          {isDone ? <CheckCircle size={24} color="var(--accent-green, #10b981)" /> : <Circle size={24} color="var(--text-muted, #94a3b8)" />}
                        </div>
                        <span style={{ color: isDone ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary, #0f172a)', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {habit.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TrendingUp size={14} /> {habitStreak}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {habits.length > 0 && habits.every(h => getHabitDates(h).includes(today)) && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--accent-green, #10b981)', fontWeight: 'bold', backgroundColor: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px' }}>
                    All done for today! 🎉
                  </div>
                )}
              </div>
            )}
          </div>

          {atRiskHabits.length > 0 && (
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--accent-red, #ef4444)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> At-Risk Habits
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {atRiskHabits.map((risk, idx) => (
                  <div key={idx} className="risk-card" style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red, #ef4444)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>{risk.habitName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)' }}>Risk Level: {risk.riskLevel} | Missed: {risk.missedDays} days</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary, #0f172a)' }}>Recommendations</h3>
            {recommendations.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>No recommendations today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} className="recoCard" style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary, #f8fafc)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>{rec.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)' }}>{rec.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary, #0f172a)' }}>Recent Achievements</h3>
            {recentBadges.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>No recent badges.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentBadges.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{b.icon || '🏆'}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)' }}>{b.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>{new Date(b.unlockedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary, #0f172a)' }}>Activity Timeline</h3>
            {activityTimeline.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>No activity today yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activityTimeline.map((act, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary, #6366f1)' }}></div>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>{act.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)', backgroundColor: 'var(--bg-secondary, #f8fafc)', padding: '2px 6px', borderRadius: '4px' }}>
                      +{act.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} /> Daily Missions
        </h3>
        {dailyMissions.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #94a3b8)' }}>No missions available right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {dailyMissions.map(m => (
              <div key={m.id} className="mission-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: m.completed ? 'var(--bg-secondary, #f8fafc)' : 'var(--bg-card, #ffffff)', borderRadius: '12px', border: m.completed ? '1px solid transparent' : '1px solid var(--accent-primary, #6366f1)', opacity: m.completed ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{m.icon || '🎯'}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-amber, #f59e0b)' }}>+{m.xpReward} XP · 🪙 {m.coinReward}</div>
                  </div>
                </div>
                {!m.completed && (
                  <button onClick={() => completeMission(m.id)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', backgroundColor: 'var(--accent-primary, #6366f1)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    Complete
                  </button>
                )}
                {m.completed && <CheckCircle size={20} color="var(--accent-green, #10b981)" />}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
