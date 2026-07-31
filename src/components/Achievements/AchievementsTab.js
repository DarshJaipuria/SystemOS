// FILE: src/components/Achievements/AchievementsTab.js
'use client';

import React, { useState, useEffect } from 'react';
import { gamificationStore, BADGE_DEFINITIONS } from '@/lib/gamificationStore';
import ConfettiCanvas from '@/components/shared/ConfettiCanvas';
import styles from '@/app/page.module.css';

export default function AchievementsTab({ user }) {
  const [gameState, setGameState] = useState({ xp: 0, level: 1, coins: 0, badges: [] });
  const [missions, setMissions] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    const load = () => {
      if (typeof window !== 'undefined' && gamificationStore && mounted) {
        try {
          setGameState(gamificationStore.getState() || { xp: 0, level: 1, coins: 0, badges: [] });
          setMissions(gamificationStore.getDailyMissions() || []);
        } catch (e) {
          console.error("Error loading gamification state", e);
        }
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const completeMission = (id) => {
    if (gamificationStore?.completeMission) {
      gamificationStore.completeMission(id);
      setMissions(gamificationStore.getDailyMissions());
      setGameState(gamificationStore.getState());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('triggerConfetti'));
      }
    }
  };

  const useStreakFreeze = () => {
    if (gameState.coins >= 50) {
      if (typeof window !== 'undefined') {
        alert("Streak freeze purchased! Your streak is safe for tomorrow.");
      }
      // Add logic to store if needed
    }
  };

  const shareAchievement = () => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hackathon Habit Tracker', 300, 60);
    
    ctx.font = '24px sans-serif';
    const userName = typeof user === 'string' ? user : (user?.name || user?.email || 'Awesome Learner');
    ctx.fillText(`Student: ${userName}`, 300, 120);
    
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Level ${gameState.level}`, 300, 200);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`${gameState.xp} Total XP earned`, 300, 250);
    
    const unlockedCount = gameState.badges?.filter(b => b.unlockedAt)?.length || 0;
    ctx.fillText(`${unlockedCount} Badges Unlocked 🏆`, 300, 300);

    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'achievement-card.png';
      a.click();
    } catch(e) {
      console.error("Canvas export failed", e);
    }
  };

  const currentLevelXP = (gameState.level - 1) * 100;
  const nextLevelXP = gameState.level * 100;
  const progressPct = ((gameState.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const unlockedCount = gameState.badges?.filter(b => b.unlockedAt)?.length || 0;
  const totalBadges = BADGE_DEFINITIONS?.length || 15;
  const hoursUntilMidnight = 24 - new Date().getHours();

  return (
    <div className={styles.achievementsTab || ''} style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', position: 'relative' }}>
      <ConfettiCanvas />
      
      <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundImage: 'linear-gradient(135deg, var(--bg-card, #ffffff), rgba(99, 102, 241, 0.1))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: 'var(--text-primary, #0f172a)' }}>Level {gameState.level} — Student</h2>
            <div style={{ color: 'var(--text-secondary, #475569)', fontSize: '14px', marginBottom: '16px' }}>{gameState.xp} / {nextLevelXP} XP to next level</div>
            
            <div style={{ width: '100%', maxWidth: '400px', height: '12px', backgroundColor: 'var(--bg-secondary, #f8fafc)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, progressPct))}%`, backgroundColor: 'var(--accent-primary, #6366f1)', transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-amber, #f59e0b)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--accent-amber, #f59e0b)' }}>
              🪙 {gameState.coins} coins
            </div>
            <button onClick={useStreakFreeze} disabled={gameState.coins < 50} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--accent-primary, #6366f1)', backgroundColor: gameState.coins >= 50 ? 'transparent' : 'var(--bg-secondary, #f8fafc)', color: gameState.coins >= 50 ? 'var(--accent-primary, #6366f1)' : 'var(--text-muted, #94a3b8)', cursor: gameState.coins >= 50 ? 'pointer' : 'not-allowed', fontSize: '12px' }}>
              Use 50 coins to protect streak 🧊
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary, #0f172a)' }}>Achievement Collection ({unlockedCount}/{totalBadges})</h3>
          <button onClick={shareAchievement} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-primary, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>📤</span> Share Card
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
          {BADGE_DEFINITIONS && BADGE_DEFINITIONS.map(def => {
            const unlocked = gameState.badges?.find(b => b.id === def.id && b.unlockedAt);
            return (
              <div 
                key={def.id} 
                onClick={() => unlocked && setSelectedBadge({ ...def, ...unlocked })}
                className="achievement-badge"
                title={def.description}
                style={{ 
                  padding: '16px 8px', 
                  borderRadius: '12px', 
                  backgroundColor: unlocked ? 'var(--bg-secondary, #f8fafc)' : 'var(--bg-card, #ffffff)', 
                  border: unlocked ? '2px solid var(--accent-primary, #6366f1)' : '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  cursor: unlocked ? 'pointer' : 'default',
                  opacity: unlocked ? 1 : 0.5,
                  filter: unlocked ? 'none' : 'grayscale(100%)',
                  transition: 'transform 0.2s',
                  boxShadow: unlocked ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{unlocked ? def.icon : '❓'}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>{def.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>{unlocked ? 'Unlocked!' : 'Locked'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-primary, #0f172a)' }}>Daily Missions</h3>
        <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>Resets in {hoursUntilMidnight} hours</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {missions.map(m => (
            <div key={m.id} className="mission-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-secondary, #f8fafc)', borderRadius: '12px', border: m.completed ? '1px solid var(--accent-green, #10b981)' : '1px solid var(--border-color, #e2e8f0)', opacity: m.completed ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '28px' }}>{m.icon || '🎯'}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--accent-amber, #f59e0b)' }}>+{m.xpReward} XP · 🪙 {m.coinReward}</div>
                </div>
              </div>
              {!m.completed ? (
                <button onClick={() => completeMission(m.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-primary, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  Complete
                </button>
              ) : (
                <div style={{ padding: '8px', color: 'var(--accent-green, #10b981)' }}>
                  ✓ Done
                </div>
              )}
            </div>
          ))}
          {missions.length === 0 && (
            <div style={{ color: 'var(--text-muted, #94a3b8)' }}>No missions available today. Check back tomorrow!</div>
          )}
        </div>
      </div>

      {selectedBadge && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedBadge(null)}>
          <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '360px', backgroundColor: 'var(--bg-card, #ffffff)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '64px', animation: 'bounce 2s infinite' }}>{selectedBadge.icon}</div>
            <h2 style={{ margin: 0, color: 'var(--text-primary, #0f172a)' }}>{selectedBadge.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary, #475569)', lineHeight: 1.5 }}>{selectedBadge.description}</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginTop: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-secondary, #f8fafc)', borderRadius: '16px' }}>
              Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
            </div>
            <button onClick={() => setSelectedBadge(null)} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--accent-primary, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              Awesome
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
