// FILE: src/components/Habits/HabitsTab.js
'use client';

import React, { useState } from 'react';
import { HABIT_TEMPLATES } from '@/lib/demoData';
import TrackerTable from '@/components/TrackerTable';
import WeeklyHabitsCard from '@/components/WeeklyHabitsCard';
import MonthlyHabitsCard from '@/components/MonthlyHabitsCard';
import { gamificationStore } from '@/lib/gamificationStore';
import styles from '@/app/page.module.css';

export default function HabitsTab(props) {
  const {
    user, habits = [], weeklyHabits, monthlyHabits, selectedMonth, selectedYear,
    handleAddHabit, handleDeleteHabit, handleToggleCompletion,
    handleAddWeekly, handleToggleWeekly, handleDeleteWeekly,
    handleAddMonthly, handleToggleMonthly, handleDeleteMonthly,
    newHabitName, setNewHabitName, newHabitGoal, setNewHabitGoal,
    calendarCols, habitsStats, daysCount, validClaimedRewards,
    handleOpenClaimModal, getUnlockedRewards, openEditRewards
  } = props;

  const [activeView, setActiveView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = ['All', 'Study', 'Health', 'Fitness', 'Wellness', 'Focus', 'Other'];

  const getCategory = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('study') || n.includes('read') || n.includes('hw')) return 'Study';
    if (n.includes('water') || n.includes('sleep') || n.includes('eat')) return 'Health';
    if (n.includes('workout') || n.includes('run') || n.includes('gym')) return 'Fitness';
    if (n.includes('meditat') || n.includes('journal')) return 'Wellness';
    if (n.includes('focus') || n.includes('code')) return 'Focus';
    return 'Other';
  };

  const filteredHabits = (habits || []).filter(h => {
    if (!h) return false;
    const habitName = h.name || h.title || '';
    const matchSearch = habitName.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchCat = activeCategory === 'All' || getCategory(habitName) === activeCategory;
    return matchSearch && matchCat;
  });

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const confirmAddTemplate = () => {
    if (!selectedTemplate) return;
    if (selectedTemplate.habits) {
      selectedTemplate.habits.forEach(async (h) => {
        const habitName = typeof h === 'string' ? h : (h?.name || h?.title);
        const goal = (typeof h === 'object' && h?.goalDays) ? h.goalDays : 30;
        if (habitName) {
          try {
            await fetch('/api/v1/habits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: habitName, goalDays: goal, month: selectedMonth, year: selectedYear })
            });
          } catch (e) {}
        }
      });
      if (gamificationStore?.addXP) {
        gamificationStore.addXP(50, 'template_added');
      }
    }
    setShowModal(false);
    setSelectedTemplate(null);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.habitsTab || ''} style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {TrackerTable ? <TrackerTable {...props} /> : <div>TrackerTable component missing</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {WeeklyHabitsCard ? (
            <WeeklyHabitsCard
              {...props}
              onAddWeekly={handleAddWeekly}
              onToggleWeekly={handleToggleWeekly}
              onDeleteWeekly={handleDeleteWeekly}
              weeklyPercent={props.weeklyPercent}
            />
          ) : null}
          {MonthlyHabitsCard ? (
            <MonthlyHabitsCard
              {...props}
              onAddMonthly={handleAddMonthly}
              onToggleMonthly={handleToggleMonthly}
              onDeleteMonthly={handleDeleteMonthly}
              monthlyPercent={props.monthlyPercent}
            />
          ) : null}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>Quick Add Habit</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Habit name..."
              value={newHabitName || ''}
              onChange={(e) => setNewHabitName && setNewHabitName(e.target.value)}
              style={{ flex: '1 1 200px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-secondary, #f8fafc)', color: 'var(--text-primary, #0f172a)' }}
            />
            <input
              type="number"
              placeholder="Goal days"
              min="1"
              max={daysCount || 31}
              value={newHabitGoal || 15}
              onChange={(e) => setNewHabitGoal && setNewHabitGoal(Math.min(daysCount || 31, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: '100px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-secondary, #f8fafc)', color: 'var(--text-primary, #0f172a)' }}
            />
            <button
              onClick={() => handleAddHabit && handleAddHabit(newHabitName, newHabitGoal)}
              style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'var(--accent-primary, #6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Add
            </button>
          </div>
        </div>

        {openEditRewards && (
          <button
            onClick={openEditRewards}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--panel-bg, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--accent-primary, #6366f1)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            🎁 Edit Monthly Rewards
          </button>
        )}
      </div>
    </div>
  );
}
