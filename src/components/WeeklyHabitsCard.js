'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function WeeklyHabitsCard({
  weeklyHabits: propWeeklyHabits = [],
  newWeeklyName = {},
  setNewWeeklyName,
  onAddWeekly,
  onToggleWeekly,
  onDeleteWeekly
}) {
  const weeks = [1, 2, 3, 4, 5];
  const [weeklyHabits, setWeeklyHabits] = useState(propWeeklyHabits);

  useEffect(() => {
    setWeeklyHabits(propWeeklyHabits);
  }, [propWeeklyHabits]);

  const handleToggle = (id, completed) => {
    setWeeklyHabits(prev => prev.map(w => String(w.id) === String(id) ? { ...w, completed: Boolean(completed) } : w));
    if (onToggleWeekly) {
      onToggleWeekly(id, completed);
    }
  };

  const handleDelete = (id) => {
    setWeeklyHabits(prev => prev.filter(w => String(w.id) !== String(id)));
    if (onDeleteWeekly) {
      onDeleteWeekly(id);
    }
  };

  const handleTextChange = (weekIndex, val) => {
    if (setNewWeeklyName) {
      setNewWeeklyName(prev => ({ ...prev, [weekIndex]: val }));
    }
  };

  const totalWeekly = (weeklyHabits || []).length;
  const completedWeekly = (weeklyHabits || []).filter(w => Boolean(w.completed)).length;
  const displayPercent = totalWeekly > 0 ? Math.round((completedWeekly / totalWeekly) * 100) : 0;

  return (
    <div className={styles.weeklyHabitsCard}>
      <div className={styles.cardHeaderBlueLight}>Weekly Habits</div>
      <div className={styles.bottomCardBody}>
        {/* Weekly checklist progress ring */}
        <div className={styles.progressRingBox}>
          <svg className={styles.circularProgress} width="50" height="50" viewBox="0 0 36 36">
            <path
              className={styles.circularProgressBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={styles.circularProgressFill}
              style={{ stroke: '#719ac6' }}
              strokeDasharray={`${displayPercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className={styles.ringTextWrapper}>
            <span className={styles.ringProgressVal}>{displayPercent}%</span>
            <span className={styles.ringProgressSubtext}>weekly progress</span>
          </div>
        </div>

        {/* Week Columns */}
        <div className={styles.weeklyHabitsGrid}>
          {weeks.map(weekIdx => {
            const weekTasks = (weeklyHabits || []).filter(w => Number(w.weekIndex) === weekIdx);
            const headerColors = ['#e1ecf7', '#fce4e8', '#e3f6ed', '#fcf1db', '#ecebf7'];
            const textColors = ['#395b80', '#d7768a', '#559e7e', '#c99335', '#7b75b3'];

            return (
              <div key={weekIdx} className={styles.weeklyHabitColumn}>
                <div 
                  className={styles.weeklyColumnHeader}
                  style={{ backgroundColor: headerColors[weekIdx - 1], color: textColors[weekIdx - 1] }}
                >
                  week {weekIdx}
                </div>
                <div className={styles.weeklyHabitChecklist}>
                  {weekTasks.map(task => (
                    <div key={task.id} className={styles.weeklyCheckItem}>
                      <input 
                        type="checkbox"
                        style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                        checked={Boolean(task.completed)}
                        onChange={(e) => handleToggle(task.id, e.target.checked)}
                      />
                      <span 
                        className={`${styles.weeklyCheckText} ${Boolean(task.completed) ? styles.weeklyCompletedText : ''}`}
                        onClick={() => handleToggle(task.id, !Boolean(task.completed))}
                        style={{ cursor: 'pointer' }}
                      >
                        {task.name}
                      </span>
                      <button className={styles.actionBtn} onClick={() => handleDelete(task.id)} style={{ padding: 0, cursor: 'pointer' }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  {weekTasks.length === 0 && (
                    <div style={{ opacity: 0.4, fontSize: '9px', fontStyle: 'italic', padding: '4px 0' }}>No tasks</div>
                  )}
                </div>
                <form 
                  onSubmit={(e) => onAddWeekly && onAddWeekly(e, weekIdx)}
                  style={{ display: 'flex', gap: '2px', marginTop: '4px' }}
                >
                  <input 
                    type="text" 
                    placeholder="Add..." 
                    style={{ flex: 1, fontSize: '10px', padding: '4px', border: '1px solid #e5e0d8', borderRadius: '4px', outline: 'none' }}
                    value={newWeeklyName[weekIdx] || ''}
                    onChange={(e) => handleTextChange(weekIdx, e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    style={{ padding: '4px 6px', background: '#719ac6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Plus size={10} />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
