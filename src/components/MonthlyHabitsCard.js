'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function MonthlyHabitsCard({
  monthlyHabits: propMonthlyHabits = [],
  newMonthlyName = '',
  setNewMonthlyName,
  onAddMonthly,
  onToggleMonthly,
  onDeleteMonthly
}) {
  const [monthlyHabits, setMonthlyHabits] = useState(propMonthlyHabits);

  useEffect(() => {
    setMonthlyHabits(propMonthlyHabits);
  }, [propMonthlyHabits]);

  const handleToggle = (id, completed) => {
    setMonthlyHabits(prev => prev.map(m => String(m.id) === String(id) ? { ...m, completed: Boolean(completed) } : m));
    if (onToggleMonthly) {
      onToggleMonthly(id, completed);
    }
  };

  const handleDelete = (id) => {
    setMonthlyHabits(prev => prev.filter(m => String(m.id) !== String(id)));
    if (onDeleteMonthly) {
      onDeleteMonthly(id);
    }
  };

  const totalMonthly = (monthlyHabits || []).length;
  const completedMonthly = (monthlyHabits || []).filter(m => Boolean(m.completed)).length;
  const displayPercent = totalMonthly > 0 ? Math.round((completedMonthly / totalMonthly) * 100) : 0;

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
          {(monthlyHabits || []).map(task => (
            <div key={task.id} className={styles.monthlyCheckItem}>
              <input 
                type="checkbox"
                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                checked={Boolean(task.completed)}
                onChange={(e) => handleToggle(task.id, e.target.checked)}
              />
              <span 
                className={`${styles.monthlyCheckText} ${Boolean(task.completed) ? styles.monthlyCompletedText : ''}`}
                onClick={() => handleToggle(task.id, !Boolean(task.completed))}
                style={{ cursor: 'pointer' }}
              >
                {task.name}
              </span>
              <button className={styles.actionBtn} onClick={() => handleDelete(task.id)} style={{ cursor: 'pointer' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          
          {(monthlyHabits || []).length === 0 && (
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
            placeholder="New monthly goal..." 
            style={{ flex: 1, fontSize: '12px', padding: '8px 12px', border: '1px solid #e5e0d8', borderRadius: '6px', outline: 'none' }}
            value={newMonthlyName || ''}
            onChange={(e) => setNewMonthlyName && setNewMonthlyName(e.target.value)}
            required
          />
          <button 
            type="submit" 
            style={{ padding: '8px 16px', background: '#d7768a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '12px' }}
          >
            <Plus size={14} /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
