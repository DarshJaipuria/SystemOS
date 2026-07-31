'use client';

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Sun, Moon, LayoutDashboard, Flame, Leaf, Target,
  BarChart3, Users, Trophy, Zap, Play, ChevronRight
} from 'lucide-react';
import styles from './page.module.css';
import { clientUtils } from '@/lib/clientUtils';
import ConfettiCanvas from '@/components/shared/ConfettiCanvas';

// Existing components (kept)
import AffirmationBar from '@/components/AffirmationBar';
import TrackerTable from '@/components/TrackerTable';
import AnalyticsSection from '@/components/AnalyticsSection';
import RightSidebar from '@/components/RightSidebar';
import WeeklyHabitsCard from '@/components/WeeklyHabitsCard';
import MonthlyHabitsCard from '@/components/MonthlyHabitsCard';
import ReflectionCard from '@/components/ReflectionCard';
import Modals from '@/components/Modals';

// New tab components (lazy loaded)
const DashboardTab = lazy(() => import('@/components/Dashboard/DashboardTab'));
const HabitsTab = lazy(() => import('@/components/Habits/HabitsTab'));
const WellnessTab = lazy(() => import('@/components/Wellness/WellnessTab'));
const FocusTab = lazy(() => import('@/components/Focus/FocusTab'));
const AnalyticsTab = lazy(() => import('@/components/Analytics/AnalyticsTab'));
const SocialTab = lazy(() => import('@/components/Social/SocialTab'));
const AchievementsTab = lazy(() => import('@/components/Achievements/AchievementsTab'));

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { id: 'habits', label: 'Habits', icon: Flame, shortcut: '2' },
  { id: 'wellness', label: 'Wellness', icon: Leaf, shortcut: '3' },
  { id: 'focus', label: 'Focus', icon: Target, shortcut: '4' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, shortcut: '5' },
  { id: 'social', label: 'Social', icon: Users, shortcut: '6' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, shortcut: '7' },
];

// Fallback tab content for Suspense
function TabSkeleton() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
      ))}
    </div>
  );
}

// Toast notification component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--accent-red)' : 'var(--accent-primary)';
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
      background: bg, color: 'white', padding: '12px 20px',
      borderRadius: '12px', fontSize: '13px', fontWeight: '600',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.3s ease-out',
    }}>
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [gamifState, setGamifState] = useState({ xp: 0, level: 1, coins: 0 });
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const presentationRef = useRef(null);

  // Date selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data states (existing)
  const [habits, setHabits] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);
  const [monthlyHabits, setMonthlyHabits] = useState([]);
  const [reflection, setReflection] = useState(null);
  const [hasPrevMonthHabits, setHasPrevMonthHabits] = useState(false);
  const [prevMonthDetails, setPrevMonthDetails] = useState({ month: 1, year: 2026 });
  const [showImportModal, setShowImportModal] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardsFormNames, setRewardsFormNames] = useState(['', '', '', '', '']);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedClaimDate, setSelectedClaimDate] = useState('');
  const [selectedClaimedIds, setSelectedClaimedIds] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState(30);
  const [newWeeklyName, setNewWeeklyName] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '' });
  const [newMonthlyName, setNewMonthlyName] = useState('');
  const [editingHabit, setEditingHabit] = useState(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitGoal, setEditHabitGoal] = useState(30);
  const [reflectionText, setReflectionText] = useState('');
  const [affirmationText, setAffirmationText] = useState('');
  const reflectionTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const daysCount = clientUtils.getDaysInMonth(selectedYear, selectedMonth);

  useEffect(() => { setNewHabitGoal(daysCount); }, [daysCount]);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load gamification state
    try {
      const raw = localStorage.getItem('sysos_gamification');
      if (raw) {
        const g = JSON.parse(raw);
        setGamifState({ xp: g.xp || 0, level: g.level || 1, coins: g.coins || 0 });
      }
    } catch {}

    // Check demo mode
    try {
      setIsDemoMode(localStorage.getItem('sysos_demo_mode') === 'true');
    } catch {}
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key >= '1' && e.key <= '7') {
        const tab = TABS[parseInt(e.key) - 1];
        if (tab) setActiveTab(tab.id);
      }
      if (e.key === 'd' || e.key === 'D') handleToggleDemoMode();
      if (e.key === 'Escape' && isPresentationMode) stopPresentation();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPresentationMode]);

  // Auth check & Automatic Vercel Demo Seeding
  useEffect(() => {
    async function checkAuth() {
      try {
        const { demoMode } = await import('@/lib/demoMode');
        // Always seed demo data on fresh domain loads
        if (typeof window !== 'undefined' && (!localStorage.getItem('sysos_wellness') || localStorage.getItem('sysos_demo_mode') === 'true')) {
          demoMode.enable();
          setIsDemoMode(true);
        }

        const res = await fetch('/api/v1/auth/me');
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser({ id: 'demo_user', name: 'DJ', email: 'darshjaipuria@gmail.com' });
        }
      } catch {
        try {
          const { demoMode } = await import('@/lib/demoMode');
          demoMode.enable();
          setIsDemoMode(true);
        } catch (e) {}
        setUser({ id: 'demo_user', name: 'DJ', email: 'darshjaipuria@gmail.com' });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        let loadedHabits = [];
        let data = {};
        try {
          const res = await fetch(`/api/v1/habits?month=${selectedMonth}&year=${selectedYear}`);
          if (res.ok) {
            data = await res.json();
            loadedHabits = data.habits || [];
          }
        } catch (e) {}

        const { demoMode } = await import('@/lib/demoMode');
        demoMode.enable();
        setIsDemoMode(true);
        const demoHabits = demoMode.getDemoHabits();

        if (loadedHabits.length === 0) {
          loadedHabits = demoHabits;
        } else {
          loadedHabits = [...loadedHabits, ...demoHabits.filter(dh => !loadedHabits.some(h => h.name.toLowerCase() === dh.name.toLowerCase()))];
        }

        const defaultWeekly = [
          { id: 'w_demo_1', weekIndex: 1, name: 'Organize study planner', completed: true },
          { id: 'w_demo_2', weekIndex: 2, name: 'Review week 1 & 2 notes', completed: true },
          { id: 'w_demo_3', weekIndex: 3, name: 'Complete practice test', completed: false },
          { id: 'w_demo_4', weekIndex: 4, name: 'Summarize key subjects', completed: false },
          { id: 'w_demo_5', weekIndex: 5, name: 'Plan next month goals', completed: false }
        ];
        const defaultMonthly = [
          { id: 'm_demo_1', name: 'Read 1 Skill / Non-Fiction Book', completed: true },
          { id: 'm_demo_2', name: 'Maintain 80%+ Health Score all month', completed: false },
          { id: 'm_demo_3', name: 'Complete 20+ Pomodoro Sessions', completed: true }
        ];

        setHabits(loadedHabits);
        setWeeklyHabits(data.weeklyHabits && data.weeklyHabits.length > 0 ? data.weeklyHabits : defaultWeekly);
        setMonthlyHabits(data.monthlyHabits && data.monthlyHabits.length > 0 ? data.monthlyHabits : defaultMonthly);
        setReflection(data.reflection || null);
        setReflectionText(data.reflection?.text || '');
        setAffirmationText(data.reflection?.affirmation || 'Focused, intentional, and ready for the month ahead.');
        setHasPrevMonthHabits(data.hasPrevMonthHabits || false);
        setPrevMonthDetails(data.prevMonthDetails || { month: selectedMonth - 1 || 12, year: selectedMonth === 1 ? selectedYear - 1 : selectedYear });
          if (data.habits.length === 0 && data.hasPrevMonthHabits) {
            setShowImportModal(true);
          }
        try {
          const rewardsRes = await fetch(`/api/v1/rewards?month=${selectedMonth}&year=${selectedYear}`);
          const rewardsData = await rewardsRes.json();
          if (rewardsRes.ok) {
            const loadedRewards = rewardsData.rewards || [];
            setRewards(loadedRewards);
            setClaimedRewards(rewardsData.claimedRewards || []);
            if (loadedRewards.length === 0) {
              setRewardsFormNames([
                'Cheat meal (sweet treat or fast food)',
                'Sleep in / extra hour of rest',
                'Watch a favorite movie / show episode',
                'Buy something nice (small budget item)',
                'Play video games / hobby time for 1 hour'
              ]);
              setShowRewardsModal(true);
            }
          }
        } catch (e) {}
      } catch (err) {
        console.warn('fetchData error:', err);
      }
    }
    fetchData();
  }, [user, selectedMonth, selectedYear]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {}
  };

  const handleToggleDemoMode = async () => {
    try {
      const { demoMode } = await import('@/lib/demoMode');
      const newState = demoMode.toggle();
      setIsDemoMode(newState);
      showToast(newState ? '🎭 Demo Mode ON — 180 days of data loaded!' : '🔄 Demo Mode OFF', newState ? 'info' : 'success');
      // Refresh gamif display
      try {
        const raw = localStorage.getItem('sysos_gamification');
        if (raw) {
          const g = JSON.parse(raw);
          setGamifState({ xp: g.xp || 0, level: g.level || 1, coins: g.coins || 0 });
        }
      } catch {}
    } catch (err) {
      console.error('Demo mode toggle error:', err);
    }
  };

  // Presentation mode
  const startPresentation = () => {
    setIsPresentationMode(true);
    let idx = 0;
    const tabIds = TABS.map(t => t.id);
    setActiveTab(tabIds[0]);
    presentationRef.current = setInterval(() => {
      idx++;
      if (idx >= tabIds.length) {
        stopPresentation();
        return;
      }
      setActiveTab(tabIds[idx]);
    }, 6000);
  };

  const stopPresentation = () => {
    setIsPresentationMode(false);
    if (presentationRef.current) {
      clearInterval(presentationRef.current);
      presentationRef.current = null;
    }
  };

  // ── All existing handlers (unchanged) ──────────────────────────────────────

  const handleImportHabits = async () => {
    try {
      const res = await fetch('/api/v1/habits/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          prevMonth: prevMonthDetails.month,
          prevYear: prevMonthDetails.year
        }),
      });
      if (res.ok) {
        setShowImportModal(false);
        const refreshRes = await fetch(`/api/v1/habits?month=${selectedMonth}&year=${selectedYear}`);
        const data = await refreshRes.json();
        if (refreshRes.ok) {
          setHabits(data.habits || []);
          setWeeklyHabits(data.weeklyHabits || []);
          setMonthlyHabits(data.monthlyHabits || []);
          setReflection(data.reflection || null);
          setReflectionText(data.reflection?.text || '');
          setAffirmationText(data.reflection?.affirmation || '');
        }
      }
    } catch (err) { console.error('Import habits error:', err); }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const validGoalDays = Math.min(daysCount, Math.max(1, parseInt(newHabitGoal) || daysCount));
    try {
      const res = await fetch('/api/v1/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabitName.trim(), goalDays: validGoalDays, month: selectedMonth, year: selectedYear }),
      });
      const data = await res.json();
      if (res.ok) {
        setHabits([...habits, { ...data, completions: [] }]);
        setNewHabitName('');
        setNewHabitGoal(daysCount);
        showToast('✅ Habit added!');
        // Award XP
        try { const { gamificationStore } = await import('@/lib/gamificationStore'); const r = gamificationStore.addXP(10, 'habit_created'); setGamifState(g => ({ ...g, xp: r.newXP, level: r.newLevel })); } catch {}
      } else {
        showToast(data.error?.message || 'Failed to add habit', 'error');
      }
    } catch (err) { console.error('Add habit error:', err); }
  };

  const openEditHabit = (habit) => {
    setEditingHabit(habit);
    setEditHabitName(habit.name);
    setEditHabitGoal(Math.min(daysCount, Math.max(1, habit.goalDays || daysCount)));
  };

  const handleUpdateHabit = async (e) => {
    e.preventDefault();
    if (!editHabitName.trim() || !editingHabit) return;
    const validGoalDays = Math.min(daysCount, Math.max(1, parseInt(editHabitGoal) || daysCount));
    try {
      const res = await fetch(`/api/v1/habits/${editingHabit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editHabitName.trim(), goalDays: validGoalDays }),
      });
      const data = await res.json();
      if (res.ok) {
        setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, name: data.name, goalDays: data.goalDays } : h));
        setEditingHabit(null);
      } else {
        showToast(data.error?.message || 'Failed to update habit', 'error');
      }
    } catch (err) { console.error('Update habit error:', err); }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm('Delete this habit? All tracking data will be lost.')) return;
    try {
      const res = await fetch(`/api/v1/habits/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setHabits(habits.filter(h => h.id !== id));
        showToast('🗑️ Habit deleted');
      } else {
        showToast(data.error?.message || 'Failed to delete habit', 'error');
      }
    } catch (err) { console.error('Delete habit error:', err); }
  };

  const handleAddWeekly = async (e, weekIndex) => {
    e.preventDefault();
    const taskName = newWeeklyName[weekIndex];
    if (!taskName?.trim()) return;
    try {
      const res = await fetch('/api/v1/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: taskName.trim(), month: selectedMonth, year: selectedYear, weekIndex }),
      });
      const data = await res.json();
      if (res.ok) {
        setWeeklyHabits([...weeklyHabits, data]);
        setNewWeeklyName({ ...newWeeklyName, [weekIndex]: '' });
      } else {
        showToast(data.error?.message || 'Failed to add weekly task', 'error');
      }
    } catch (err) { console.error('Add weekly task error:', err); }
  };

  const handleToggleWeekly = async (id, completed) => {
    setWeeklyHabits(weeklyHabits.map(w => w.id === id ? { ...w, completed } : w));
    try {
      const res = await fetch('/api/v1/weekly', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });
      if (!res.ok) {
        setWeeklyHabits(weeklyHabits.map(w => w.id === id ? { ...w, completed: !completed } : w));
        const data = await res.json();
        showToast(data.error?.message || 'Failed to update weekly task', 'error');
      } else if (completed) {
        try { const { gamificationStore } = await import('@/lib/gamificationStore'); const r = gamificationStore.addXP(15, 'weekly_complete'); setGamifState(g => ({ ...g, xp: r.newXP, level: r.newLevel })); } catch {}
      }
    } catch (err) { console.error('Toggle weekly task error:', err); }
  };

  const handleDeleteWeekly = async (id) => {
    try {
      const res = await fetch(`/api/v1/weekly?id=${id}`, { method: 'DELETE' });
      if (res.ok) setWeeklyHabits(weeklyHabits.filter(w => w.id !== id));
    } catch (err) { console.error('Delete weekly task error:', err); }
  };

  const handleAddMonthly = async (e) => {
    e.preventDefault();
    if (!newMonthlyName.trim()) return;
    try {
      const res = await fetch('/api/v1/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMonthlyName.trim(), month: selectedMonth, year: selectedYear }),
      });
      const data = await res.json();
      if (res.ok) {
        setMonthlyHabits([...monthlyHabits, data]);
        setNewMonthlyName('');
      } else {
        showToast(data.error?.message || 'Failed to add objective', 'error');
      }
    } catch (err) { console.error('Add monthly objective error:', err); }
  };

  const handleToggleMonthly = async (id, completed) => {
    setMonthlyHabits(monthlyHabits.map(m => m.id === id ? { ...m, completed } : m));
    try {
      const res = await fetch('/api/v1/monthly', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });
      if (!res.ok) {
        setMonthlyHabits(monthlyHabits.map(m => m.id === id ? { ...m, completed: !completed } : m));
        const data = await res.json();
        showToast(data.error?.message || 'Failed to update objective', 'error');
      } else if (completed) {
        try { const { gamificationStore } = await import('@/lib/gamificationStore'); const r = gamificationStore.addXP(30, 'monthly_complete'); setGamifState(g => ({ ...g, xp: r.newXP, level: r.newLevel })); } catch {}
      }
    } catch (err) { console.error('Toggle monthly objective error:', err); }
  };

  const handleDeleteMonthly = async (id) => {
    try {
      const res = await fetch(`/api/v1/monthly?id=${id}`, { method: 'DELETE' });
      if (res.ok) setMonthlyHabits(monthlyHabits.filter(m => m.id !== id));
    } catch (err) { console.error('Delete monthly objective error:', err); }
  };

  const handleToggleCompletion = async (habitId, dateStr, isCompleted) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) {
      showToast('⚠️ Future dates cannot be marked as completed', 'warning');
      return;
    }

    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id !== habitId) return habit;
      const currentCompletions = habit.completions || [];
      const updatedCompletions = isCompleted
        ? [...currentCompletions.filter(c => c.date !== dateStr), { date: dateStr }]
        : currentCompletions.filter(c => c.date !== dateStr);
      return { ...habit, completions: updatedCompletions };
    }));

    try {
      const res = await fetch('/api/v1/completions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date: dateStr, completed: isCompleted }),
      });
      if (!res.ok) {
        setHabits(prevHabits => prevHabits.map(habit => {
          if (habit.id !== habitId) return habit;
          const currentCompletions = habit.completions || [];
          const rolledBackCompletions = isCompleted
            ? currentCompletions.filter(c => c.date !== dateStr)
            : [...currentCompletions.filter(c => c.date !== dateStr), { date: dateStr }];
          return { ...habit, completions: rolledBackCompletions };
        }));
      } else if (isCompleted) {
        // Award XP for completing a habit
        try {
          const { gamificationStore } = await import('@/lib/gamificationStore');
          const r = gamificationStore.addXP(20, 'habit_complete');
          setGamifState(g => ({ ...g, xp: r.newXP, level: r.newLevel }));
          if (r.leveledUp) {
            showToast(`🎉 Level Up! You're now Level ${r.newLevel}!`, 'info');
            window.dispatchEvent(new CustomEvent('triggerConfetti'));
          }
        } catch {}

        // Check if all habits completed today → confetti
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr === todayStr) {
          const todayCompletions = habits.filter(h =>
            h.id === habitId
              ? true
              : h.completions?.some(c => c.date === todayStr)
          );
          if (todayCompletions.length === habits.length && habits.length > 0) {
            window.dispatchEvent(new CustomEvent('triggerConfetti'));
            showToast('🎊 All habits done today! Amazing!', 'info');
          }
        }
      }
    } catch (err) { console.error('Toggle completion error:', err); }
  };

  const handleSaveRewards = async () => {
    try {
      const res = await fetch('/api/v1/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear, rewards: rewardsFormNames })
      });
      const data = await res.json();
      if (res.ok) {
        setRewards(data.rewards || []);
        setShowRewardsModal(false);
      } else {
        showToast(data.error?.message || 'Failed to save rewards', 'error');
      }
    } catch (err) { console.error('Error saving rewards:', err); }
  };

  const handleSaveClaims = async () => {
    try {
      const res = await fetch('/api/v1/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedClaimDate, claimedRewardIds: selectedClaimedIds })
      });
      const data = await res.json();
      if (res.ok) {
        const rewardsRes = await fetch(`/api/v1/rewards?month=${selectedMonth}&year=${selectedYear}`);
        const rewardsData = await rewardsRes.json();
        if (rewardsRes.ok) setClaimedRewards(rewardsData.claimedRewards || []);
      } else {
        showToast(data.error?.message || 'Failed to save claims', 'error');
      }
    } catch (err) { console.error('Error claiming rewards:', err); }
  };

  const handleSaveAffirmation = async (text) => {
    try {
      await fetch('/api/v1/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear, affirmation: text })
      });
    } catch {}
  };

  const handleSaveReflectionText = (text) => {
    if (reflectionTimer.current) clearTimeout(reflectionTimer.current);
    reflectionTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month: selectedMonth, year: selectedYear, text })
        });
        const data = await res.json();
        if (res.ok) setReflection(data);
      } catch {}
    }, 1000);
  };

  const handleUploadPolaroid = async () => {
    const url = prompt("Enter a web photo URL to save to your polaroid frame:", reflection?.polaroidUrl || '');
    if (url === null) return;
    try {
      const res = await fetch('/api/v1/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear, polaroidUrl: url || '' })
      });
      const data = await res.json();
      if (res.ok) setReflection(data);
      else showToast(data.error?.message || 'Failed to save polaroid URL', 'error');
    } catch {}
  };

  const openEditRewards = () => {
    const names = rewards.length > 0 ? rewards.map(r => r.name) : [''];
    setRewardsFormNames(names);
    setShowRewardsModal(true);
  };

  const handleOpenClaimModal = (dateStr) => {
    setSelectedClaimDate(dateStr);
    const dayClaims = validClaimedRewards.filter(c => c.date === dateStr);
    setSelectedClaimedIds(dayClaims.map(c => c.rewardId));
    setShowClaimModal(true);
  };

  // ── Computed values ──────────────────────────────────────────────────────────

  const overallProgress = clientUtils.calculateOverallProgress(habits);
  const allCompletions = habits.reduce((acc, h) => {
    h.completions?.forEach(c => acc.push(c.date));
    return acc;
  }, []);
  const longestStreak = clientUtils.calculateLongestStreak(allCompletions);
  const currentStreak = clientUtils.calculateCurrentStreak(allCompletions);

  const calendarCols = [];
  for (let i = 0; i < 35; i++) {
    const dayIndex = i + 1;
    if (dayIndex <= daysCount) {
      const date = new Date(selectedYear, selectedMonth - 1, dayIndex);
      const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayIndex).padStart(2, '0')}`;
      calendarCols.push({ inMonth: true, dayNum: dayIndex, dayLetter, dateStr, weekIndex: Math.floor(i / 7) + 1 });
    } else {
      const nextMonthDay = dayIndex - daysCount;
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      const date = new Date(nextYear, nextMonth - 1, nextMonthDay);
      const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
      calendarCols.push({ inMonth: false, dayNum: nextMonthDay, dayLetter, weekIndex: Math.floor(i / 7) + 1 });
    }
  }

  const weeklyPercent = clientUtils.getWeeklyChecklistPercent(weeklyHabits);
  const monthlyPercent = clientUtils.getMonthlyChecklistPercent(monthlyHabits);

  const getWeekStats = (weekIndex) => {
    const startDay = (weekIndex - 1) * 7 + 1;
    const endDay = Math.min(weekIndex * 7, daysCount);
    const totalChecksPossible = habits.length * (endDay - startDay + 1);
    let checksCompleted = 0;
    habits.forEach(h => {
      h.completions?.forEach(c => {
        const dayNum = parseInt(c.date.split('-')[2]);
        if (dayNum >= startDay && dayNum <= endDay) checksCompleted++;
      });
    });
    const percent = totalChecksPossible > 0 ? Math.round((checksCompleted / totalChecksPossible) * 100) : 0;
    return { percent, count: checksCompleted, total: totalChecksPossible };
  };

  const weekStats = [1, 2, 3, 4, 5].map(w => getWeekStats(w));

  const chartData = [];
  for (let day = 1; day <= daysCount; day++) {
    let completionsCount = 0;
    habits.forEach(h => {
      if (h.completions?.some(c => parseInt(c.date.split('-')[2]) === day)) completionsCount++;
    });
    chartData.push({ day, completions: completionsCount });
  }

  const getUnlockedRewards = (completionsCount) =>
    clientUtils.getUnlockedRewardsLimit(completionsCount, habits.length, rewards.length);

  const validClaimedRewards = clientUtils.getValidClaimedRewards(claimedRewards, habits, habits.length, rewards.length);

  const inMonthDateStrs = new Set(calendarCols.filter(col => col.inMonth).map(col => col.dateStr));

  const habitsStats = habits.map(habit => {
    const currentMonthCompletions = habit.completions?.filter(c => inMonthDateStrs.has(c.date)) || [];
    const completionsCount = currentMonthCompletions.length;
    const goal = habit.goalDays || 30;
    const percent = goal > 0 ? Math.round((completionsCount / goal) * 100) : 0;
    const dates = habit.completions?.map(c => c.date) || [];
    return {
      ...habit, count: completionsCount, percent,
      longestStreak: clientUtils.calculateLongestStreak(dates),
      currentStreak: clientUtils.calculateCurrentStreak(dates)
    };
  });

  const sumDailyGoals = habits.reduce((acc, h) => acc + (h.goalDays || 30), 0);
  const countWeeklyGoals = weeklyHabits.length;
  const countMonthlyGoals = monthlyHabits.length;
  const totalGoalsDenominator = sumDailyGoals + countWeeklyGoals + countMonthlyGoals;
  const completedDailyCount = habits.reduce((acc, h) => acc + (h.completions?.filter(c => inMonthDateStrs.has(c.date)).length || 0), 0);
  const completedWeeklyCount = weeklyHabits.filter(w => w.completed).length;
  const completedMonthlyCount = monthlyHabits.filter(m => m.completed).length;
  const totalCompletedNumerator = completedDailyCount + completedWeeklyCount + completedMonthlyCount;
  const overallProgressPercent = totalGoalsDenominator > 0
    ? parseFloat(((totalCompletedNumerator / totalGoalsDenominator) * 100).toFixed(2))
    : 0;
  const habitsAboveTargetCount = habitsStats.filter(h => h.count >= (h.goalDays || 30)).length;
  const topTenHabits = [...habitsStats].sort((a, b) => b.percent - a.percent).slice(0, 10);

  // ── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: '16px',
        background: 'var(--background)'
      }}>
        <div style={{ fontSize: '40px' }}>✨</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)' }}>
          Loading SystemOS...
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Your wellness dashboard is being prepared
        </div>
        <div className="skeleton" style={{ width: '200px', height: '6px', marginTop: '8px' }} />
      </div>
    );
  }

  if (!user) return null;

  // ── Common props for tab components ─────────────────────────────────────────

  const habitTabProps = {
    user, habits, weeklyHabits, monthlyHabits,
    selectedMonth, selectedYear,
    handleAddHabit, handleDeleteHabit, handleToggleCompletion,
    handleAddWeekly, handleToggleWeekly, handleDeleteWeekly,
    handleAddMonthly, handleToggleMonthly, handleDeleteMonthly,
    newHabitName, setNewHabitName, newHabitGoal, setNewHabitGoal,
    calendarCols, habitsStats, daysCount,
    validClaimedRewards, handleOpenClaimModal, getUnlockedRewards,
    openEditRewards, openEditHabit,
    weeklyPercent, monthlyPercent
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={styles.tabShell}>
      <ConfettiCanvas />

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── HEADER ── */}
      <header className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <img src="/logo.png" alt="SystemOS" style={{ height: '32px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)', lineHeight: 1 }}>
              SystemOS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
          </div>
          <select
            style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)', cursor: 'pointer' }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            min="2000" max="2099"
            style={{ width: '70px', fontSize: '12px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
          />
        </div>

        <div className={styles.headerRight}>
          {/* Gamification display */}
          <div className={styles.levelBadge}>
            ⭐ Lv.{gamifState.level}
          </div>
          <div className={styles.xpBadge}>
            ⚡ {gamifState.xp.toLocaleString()} XP
          </div>

          {/* Demo mode toggle */}
          <button
            className={`${styles.demoToggleBtn} ${isDemoMode ? styles.active : ''}`}
            onClick={handleToggleDemoMode}
            title="Toggle Demo Mode (D)"
          >
            {isDemoMode ? '🎭 Demo ON' : '🎭 Demo'}
          </button>

          {/* Presentation mode */}
          <button
            onClick={isPresentationMode ? stopPresentation : startPresentation}
            style={{
              padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer', border: '1px solid var(--border-color)',
              background: isPresentationMode ? 'var(--accent-primary)' : 'var(--card-bg)',
              color: isPresentationMode ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
            title="Presentation Mode"
          >
            {isPresentationMode ? '⏹ Stop' : '▶ Present'}
          </button>

          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-dark)' }}>
            {user?.name || 'User'}
          </span>
          <button className={styles.themeToggleBtn} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              padding: '5px 10px', borderRadius: '6px', fontSize: '12px',
              fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fce4e8'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* ── TAB NAV ── */}
      <div className={styles.tabNavWrapper}>
        <nav className="tab-nav" style={{ width: 'fit-content' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={`${tab.label} (${tab.shortcut})`}
              >
                <Icon size={15} />
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── TAB CONTENT ── */}
      <main className={styles.tabContent}>
        <Suspense fallback={<TabSkeleton />}>
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              user={user}
              habits={habits}
              weeklyHabits={weeklyHabits}
              monthlyHabits={monthlyHabits}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              handleToggleCompletion={handleToggleCompletion}
              theme={theme}
              overallProgressPercent={overallProgressPercent}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              isDemoMode={isDemoMode}
            />
          )}

          {/* Habits */}
          {activeTab === 'habits' && (
            <HabitsTab {...habitTabProps} newWeeklyName={newWeeklyName} setNewWeeklyName={setNewWeeklyName} newMonthlyName={newMonthlyName} setNewMonthlyName={setNewMonthlyName} />
          )}

          {/* Wellness */}
          {activeTab === 'wellness' && (
            <WellnessTab
              user={user}
              habits={habits}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              overallProgressPercent={overallProgressPercent}
            />
          )}

          {/* Focus */}
          {activeTab === 'focus' && (
            <FocusTab
              user={user}
              habits={habits}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              habits={habits}
              weeklyHabits={weeklyHabits}
              monthlyHabits={monthlyHabits}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              theme={theme}
              chartData={chartData}
              weekStats={weekStats}
              mounted={mounted}
              isDemoMode={isDemoMode}
            />
          )}

          {/* Social */}
          {activeTab === 'social' && (
            <SocialTab user={user} currentStreak={currentStreak} />
          )}

          {/* Achievements */}
          {activeTab === 'achievements' && (
            <AchievementsTab user={user} currentStreak={currentStreak} />
          )}
        </Suspense>
      </main>

      {/* ── MODALS (existing, unchanged) ── */}
      <Modals
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        prevMonthDetails={prevMonthDetails}
        MONTH_NAMES={MONTH_NAMES}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        handleImportHabits={handleImportHabits}
        editingHabit={editingHabit}
        setEditingHabit={setEditingHabit}
        editHabitName={editHabitName}
        setEditHabitName={setEditHabitName}
        editHabitGoal={editHabitGoal}
        setEditHabitGoal={setEditHabitGoal}
        daysCount={daysCount}
        handleUpdateHabit={handleUpdateHabit}
        showRewardsModal={showRewardsModal}
        setShowRewardsModal={setShowRewardsModal}
        rewardsFormNames={rewardsFormNames}
        setRewardsFormNames={setRewardsFormNames}
        handleSaveRewards={handleSaveRewards}
        showClaimModal={showClaimModal}
        setShowClaimModal={setShowClaimModal}
        selectedClaimDate={selectedClaimDate}
        selectedClaimedIds={selectedClaimedIds}
        setSelectedClaimedIds={setSelectedClaimedIds}
        habits={habits}
        rewards={rewards}
        getUnlockedRewards={getUnlockedRewards}
        handleSaveClaims={handleSaveClaims}
      />
    </div>
  );
}
