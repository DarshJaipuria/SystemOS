'use client';

import React from 'react';
import styles from '@/app/page.module.css';

export default function RightSidebar({
  overallProgressPercent,
  totalCompletedNumerator,
  totalGoalsDenominator,
  topTenHabits,
  habitsAboveTargetCount,
  habitsStats
}) {
  return (
    <section className={styles.rightSidebar}>
      {/* Key overall metrics */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiDetails}>
          <span className={styles.kpiLabel}>Daily Progress</span>
          <span className={styles.kpiVal}>{overallProgressPercent}%</span>
          <span className={styles.kpiRatio}>
            {totalCompletedNumerator} / {totalGoalsDenominator} completed
          </span>
        </div>
        
        {/* SVG circle progress for overall */}
        <svg className={styles.circularProgress} width="64" height="64" viewBox="0 0 36 36">
          <path
            className={styles.circularProgressBg}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={styles.circularProgressFill}
            style={{ stroke: '#d7768a' }}
            strokeDasharray={`${overallProgressPercent}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>

      {/* Top 10 Habits Ranking */}
      <div className={styles.topTenCard}>
        <div className={styles.cardHeaderBlueLight}>Top 10 Habits</div>
        <div className={styles.subTableHeader}>
          <span>daily habit</span>
          <span>progress</span>
        </div>
        <div>
          {topTenHabits.map((habit, idx) => (
            <div key={`top-${habit.id}`} className={styles.topTenItem}>
              <span className={styles.topTenName}>
                <span style={{ color: '#aa853c', fontWeight: '700', marginRight: '6px' }}>{idx + 1}</span>
                {habit.name}
              </span>
              <span className={styles.topTenPercent}>{habit.percent}%</span>
            </div>
          ))}
          {topTenHabits.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: '#8c8581' }}>
              No rankings available
            </div>
          )}
        </div>
        <div className={styles.topTenFooter}>
          Over 100% on {habitsAboveTargetCount} habits — keep going! 🚀
        </div>
      </div>

      {/* Detailed Progress / Streak Table */}
      <div className={styles.statsCard}>
        <div className={styles.cardHeaderBlueLight}>Daily Progress</div>
        <div className={styles.statsHeader}>
          <span>goal</span>
          <span className={styles.statsHeaderColName}>percentage</span>
          <span>count</span>
          <span>longest streak</span>
        </div>
        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {habitsStats.map(habit => (
            <div key={`stat-${habit.id}`} className={styles.statsRow}>
              <span className={styles.statsGoalVal}>{habit.goalDays}</span>
              <div className={styles.statsNameCell}>
                <div className={styles.statsHabitName} title={habit.name}>{habit.name}</div>
                <div className={styles.statsBarWrapper}>
                  <div 
                    className={styles.statsBarFill} 
                    style={{ 
                      width: `${Math.min(habit.percent, 100)}%`,
                      backgroundColor: habit.percent >= 100 ? '#559e7e' : '#b0cbe8'
                    }} 
                  />
                </div>
              </div>
              <span style={{ fontWeight: '600' }}>{habit.count}</span>
              <span className={styles.statsStreakVal}>{habit.longestStreak}</span>
            </div>
          ))}
          {habitsStats.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: '#8c8581' }}>
              No progress logs
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
