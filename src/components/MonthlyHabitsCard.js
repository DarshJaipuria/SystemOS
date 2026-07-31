'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function MonthlyHabitsCard({
  monthlyHabits,
  newMonthlyName,
  setNewMonthlyName,
  onAddMonthly,
  onToggleMonthly,
  onDeleteMonthly,
  monthlyPercent
}) {
  const totalMonthly = (monthlyHabits || []).length;
  const completedMonthly = (monthlyHabits || []).filter(m => m.completed).length;
  const computedPercent = totalMonthly > 0 ? Math.round((completedMonthly / totalMonthly) * 100) : 0;
  const displayPercent = Number.isFinite(Number(monthlyPercent)) ? Math.round(Number(monthlyPercent)) : computedPercent;

  return (
    <div className={styles.monthlyHabitsCard}>
      <div className={styles.cardHeaderBlueLight}>Monthly Habits</div>
      <div className={styles.bottomCardBody}>
        {/* Monthly checklist progress ring */}
        <div className={styles.progressRingBox}>
          <svg className={styles.circularProgress} width="50" height="50" viewBox="0 0 36 36">
            <path
              className={styles.circularProgressBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={styles.circularProgressFill}
              style={{ stroke: '#d7768a' }}
              strokeDasharray={`${displayPercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className={styles.ringTextWrapper}>
            <span className={styles.ringProgressVal}>{displayPercent}%</span>
            <span className={styles.ringProgressSubtext}>monthly progress</span>
          </div>
        </div>

        {/* Checklist */}
        <div className={styles.monthlyChecklist}>
          {monthlyHabits.map(task => (
            <div key={task.id} className={styles.monthlyCheckItem}>
              <input 
                type="checkbox"
                className={styles.checkbox}
                checked={task.completed}
                onChange={(e) => onToggleMonthly(task.id, e.target.checked)}
              />
              <span 
                className={`${styles.monthlyCheckText} ${task.completed ? styles.monthlyCompletedText : ''}`}
                onClick={() => onToggleMonthly(task.id, !task.completed)}
              >
                {task.name}
              </span>
              <button className={styles.actionBtn} onClick={() => onDeleteMonthly(task.id)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          
          {monthlyHabits.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>
              No monthly objectives added yet. Define your major focus points below.
            </div>
          )}
        </div>

        <form 
          onSubmit={onAddMonthly}
          style={{ display: 'flex', gap: '8px', padding: '0 16px 16px 16px' }}
        >
          <input 
            type="text" 
            placeholder="Add new monthly habit..." 
            className={styles.addHabitInput}
            value={newMonthlyName}
            onChange={(e) => setNewMonthlyName(e.target.value)}
            required
          />
          <button className={styles.addHabitBtn} type="submit">
            <Plus size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
