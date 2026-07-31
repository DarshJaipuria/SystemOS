'use client';

import React from 'react';
import { Plus, Trash2, Edit2, Gift } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function TrackerTable({
  habits = [],
  habitsStats = [],
  calendarCols = [],
  daysCount = 31,
  newHabitName = '',
  setNewHabitName,
  newHabitGoal = 15,
  setNewHabitGoal,
  handleAddHabit,
  openEditHabit,
  handleDeleteHabit,
  handleToggleCompletion,
  validClaimedRewards = [],
  handleOpenClaimModal,
  getUnlockedRewards,
  openEditRewards
}) {
  const safeCols = calendarCols || [];
  const safeHabitsStats = (habitsStats && habitsStats.length > 0) ? habitsStats : (habits || []);
  const safeClaims = validClaimedRewards || [];
  const safeGetUnlocked = typeof getUnlockedRewards === 'function' ? getUnlockedRewards : () => 0;

  return (
    <section className={styles.trackerSection}>
      <div className={styles.gridCard}>
        <div className={styles.gridTableScrollWrapper}>
          <table className={styles.gridTable}>
            <colgroup>
              <col style={{ width: '240px' }} />
              {Array(35).fill().map((_, idx) => (
                <col key={idx} style={{ width: '32px' }} />
              ))}
              <col style={{ width: '44px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '64px' }} />
              <col style={{ width: '64px' }} />
            </colgroup>
            <thead>
              {/* Row 1: Week headers */}
              <tr>
                <th className={styles.thStickyLeftDailyHabits} rowSpan={3}>
                  Daily Habits
                </th>
                {[1, 2, 3, 4, 5].map((weekIndex) => (
                  <th 
                    key={weekIndex} 
                    className={`${styles.thWeek} ${styles[`weekHeader${weekIndex}`]}`}
                    colSpan={7}
                  >
                    week {weekIndex}
                  </th>
                ))}
                <th className={`${styles.thStickyRightGoal} ${styles.thStatsSub}`} rowSpan={3} style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0', zIndex: 10 }}>
                  goal
                </th>
                <th className={`${styles.thStickyRightPercent} ${styles.thStatsSub}`} rowSpan={3} style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0', zIndex: 10 }}>
                  progress
                </th>
                <th className={`${styles.thStickyRightCount} ${styles.thStatsSub}`} rowSpan={3} style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0', zIndex: 10 }}>
                  count
                </th>
                <th className={`${styles.thStickyRightStreak} ${styles.thStatsSub}`} rowSpan={3} style={{ borderTopRightRadius: '11px', borderTopLeftRadius: '0', zIndex: 10 }}>
                  streak
                </th>
              </tr>
              
              {/* Row 2: Day letters */}
              <tr>
                {safeCols.map((col, idx) => {
                  const bgClass = styles[`thDayLetter${col.weekIndex}`];
                  return (
                    <th key={`letter-${idx}`} className={`${styles.thDayLetter} ${bgClass}`}>
                      {col.dayLetter}
                    </th>
                  );
                })}
              </tr>
              
              {/* Row 3: Day numbers */}
              <tr>
                {safeCols.map((col, idx) => {
                  const bgClass = styles[`thDateNumber${col.weekIndex}`];
                  return (
                    <th 
                      key={`date-${idx}`} 
                      className={`${styles.thDateNumber} ${bgClass}`}
                      style={{ opacity: col.inMonth ? 1 : 0.4 }}
                    >
                      {col.dayNum}
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody>
              {safeHabitsStats.map((habit, idx) => (
                <tr key={`row-${habit.id}`}>
                  {/* Habit name sticky cell */}
                  <td className={`${styles.gridCell} ${styles.tdStickyLeft}`}>
                    <div className={styles.habitCellContent}>
                      <span className={styles.habitNumber}>{idx + 1}</span>
                      <span className={styles.habitNameText} onClick={() => openEditHabit(habit)} title={habit.name}>
                        {habit.name}
                      </span>
                      <div className={styles.habitActions}>
                        <button className={styles.actionBtn} onClick={() => openEditHabit(habit)} title="Edit habit">
                          <Edit2 size={11} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDeleteHabit(habit.id)} title="Delete habit">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </td>
                  
                  {/* Calendar day checkmark boxes */}
                  {calendarCols.map((col, colIdx) => {
                    if (!col.inMonth) {
                      return <td key={`cell-${habit.id}-${colIdx}`} className={styles.gridCell} />;
                    }
                    
                    const d = new Date();
                    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const isFutureDate = col.dateStr > todayStr;
                    const isChecked = Boolean(
                      habit.completions?.some(c => (typeof c === 'string' ? c : c?.date) === col.dateStr) ||
                      habit.completedDays?.some(d => (typeof d === 'string' ? d : d?.date) === col.dateStr) ||
                      habit.history?.some(h => (typeof h === 'string' ? h : h?.date) === col.dateStr)
                    );
                    const checkboxClass = styles[`checkboxWeek${col.weekIndex}`];
                    
                    return (
                      <td key={`cell-${habit.id}-${colIdx}`} className={styles.gridCell}>
                        <input
                          className={`${styles.gridCheckbox} ${checkboxClass}`}
                          type="checkbox"
                          checked={isChecked}
                          disabled={isFutureDate}
                          onChange={(e) => {
                            if (isFutureDate) return;
                            handleToggleCompletion(habit.id, col.dateStr, e.target.checked);
                          }}
                          style={{
                            cursor: isFutureDate ? 'not-allowed' : 'pointer',
                            opacity: isFutureDate ? 0.35 : 1
                          }}
                          title={isFutureDate ? "Future dates cannot be checked yet" : `Toggle completion for ${habit.name} on date ${col.dateStr}`}
                          aria-label={`Toggle completion for ${habit.name} on date ${col.dateStr}`}
                        />
                      </td>
                    );
                  })}
                  
                  {/* Goals & Progress stats */}
                  <td className={`${styles.gridCell} ${styles.tdStickyRightGoal} ${styles.statsGoalVal}`}>
                    {habit.goalDays}
                  </td>
                  <td className={`${styles.gridCell} ${styles.tdStickyRightPercent}`}>
                    <div className={styles.statsPercentWrapper}>
                      <span className={styles.statsPercentText}>{habit.percent}%</span>
                      <div className={styles.statsBarWrapper} style={{ margin: 0, width: '45px' }}>
                        <div 
                          className={styles.statsBarFill} 
                          style={{ 
                            width: `${Math.min(habit.percent, 100)}%`,
                            backgroundColor: habit.percent >= 100 ? '#559e7e' : '#b0cbe8'
                          }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.gridCell} ${styles.tdStickyRightCount}`} style={{ fontWeight: '600' }}>
                    {habit.count}
                  </td>
                  <td className={`${styles.gridCell} ${styles.tdStickyRightStreak} ${styles.statsStreakVal}`}>
                    {habit.longestStreak}
                  </td>
                </tr>
              ))}
              
              {/* Rewards Claim Row */}
              <tr className={styles.rewardsRow}>
                <td className={`${styles.gridCell} ${styles.tdStickyLeft}`} style={{ backgroundColor: 'var(--panel-bg)', fontWeight: 'bold' }}>
                  <div className={styles.habitCellContent} style={{ gap: '6px', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Gift size={13} style={{ color: 'var(--week3-color)' }} />
                      <span style={{ fontSize: '12px', letterSpacing: '0.5px' }}>daily rewards</span>
                    </div>
                    {openEditRewards && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditRewards();
                        }}
                        title="Edit monthly reward options"
                        style={{
                          background: 'var(--panel-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: 'var(--accent-primary)',
                          fontWeight: '600'
                        }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </td>
                
                {safeCols.map((col, idx) => {
                  if (!col.inMonth) {
                    return <td key={`reward-cell-${idx}`} className={styles.gridCell} style={{ backgroundColor: 'var(--panel-bg)' }} />;
                  }
                  
                  const completionsCount = (habits || []).filter(h => 
                    h.completions?.some(c => (typeof c === 'string' ? c : c?.date) === col.dateStr) ||
                    h.completedDays?.some(d => (typeof d === 'string' ? d : d?.date) === col.dateStr) ||
                    h.history?.some(h => (typeof h === 'string' ? h : h?.date) === col.dateStr)
                  ).length;
                  
                  const unlockedRewards = safeGetUnlocked(completionsCount);
                  const dayClaims = safeClaims.filter(c => c && c.date === col.dateStr);
                  const claimedCount = dayClaims.length;
                  
                  if (unlockedRewards > 0) {
                    const isFullyClaimed = claimedCount === unlockedRewards;
                    const badgeClass = isFullyClaimed 
                      ? styles.rewardBadgeClaimed 
                      : (claimedCount > 0 ? styles.rewardBadgePartiallyClaimed : styles.rewardBadgeUnclaimed);
                      
                    return (
                      <td 
                        key={`reward-cell-${idx}`} 
                        className={styles.rewardCell}
                        onClick={() => handleOpenClaimModal && handleOpenClaimModal(col.dateStr, unlockedRewards)}
                        title="Click to claim rewards"
                        style={{ cursor: 'pointer', padding: '2px' }}
                      >
                        <span className={`${styles.rewardBadge} ${badgeClass}`}>
                          🎁 {claimedCount}/{unlockedRewards}
                        </span>
                      </td>
                    );
                  }
                  
                  return (
                    <td 
                      key={`reward-cell-${idx}`} 
                      className={styles.rewardCell}
                      onClick={() => handleOpenClaimModal && handleOpenClaimModal(col.dateStr, 1)}
                      style={{ cursor: 'pointer', padding: '2px', opacity: 0.6 }}
                      title="Click to manage monthly rewards"
                    >
                      <span className={`${styles.rewardBadge} ${styles.rewardBadgeUnclaimed}`} style={{ opacity: 0.6 }}>
                        🎁 0/1
                      </span>
                    </td>
                  );
                })}
                
                <td className={`${styles.gridCell} ${styles.tdStickyRightGoal}`} style={{ backgroundColor: 'var(--panel-bg)' }} />
                <td className={`${styles.gridCell} ${styles.tdStickyRightPercent}`} style={{ backgroundColor: 'var(--panel-bg)' }} />
                <td className={`${styles.gridCell} ${styles.tdStickyRightCount}`} style={{ backgroundColor: 'var(--panel-bg)', fontWeight: 'bold', color: 'var(--week3-color)', textAlign: 'center' }}>
                  {safeClaims.length}
                </td>
                <td className={`${styles.gridCell} ${styles.tdStickyRightStreak}`} style={{ backgroundColor: 'var(--panel-bg)' }} />
              </tr>
              
              {/* Inline Create Habit Row */}
              <tr>
                <td className={`${styles.gridCell} ${styles.tdStickyLeft}`} style={{ backgroundColor: 'var(--panel-bg)' }}>
                  <form className={styles.addHabitForm} onSubmit={handleAddHabit} style={{ padding: 0, border: 'none', background: 'transparent' }}>
                    <input 
                      className={styles.addHabitInput} 
                      type="text" 
                      placeholder="New habit..."
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      required
                      style={{ padding: '4px 8px' }}
                      aria-label="New Habit Name"
                    />
                    <input 
                      className={styles.goalInput}
                      type="number"
                      min="1"
                      max={daysCount}
                      value={newHabitGoal}
                      onChange={(e) => setNewHabitGoal(Math.min(daysCount, Math.max(1, parseInt(e.target.value) || 1)))}
                      style={{ padding: '4px 2px', width: '32px' }}
                      aria-label="Goal Days"
                    />
                    <button className={styles.addHabitBtn} type="submit" style={{ width: '24px', height: '24px' }} title="Add daily habit">
                      <Plus size={14} />
                    </button>
                  </form>
                </td>
                <td colSpan={35} style={{ backgroundColor: 'var(--panel-bg)' }} />
                <td colSpan={4} style={{ backgroundColor: 'var(--panel-bg)' }} className={styles.tdStickyRightMerged} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
