// FILE: src/components/Focus/FocusTab.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { pomodoroStore } from '@/lib/pomodoroStore';
import { gamificationStore } from '@/lib/gamificationStore';
import { wellnessStore } from '@/lib/wellnessStore';
import { Play, Pause, SkipForward, RotateCcw, Monitor, Target, BookOpen, Clock, CheckSquare, Plus, Ban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FocusTab({ user, habits, selectedMonth, selectedYear }) {
  const [examMode, setExamMode] = useState(false);
  const [phase, setPhase] = useState('study'); // 'study' | 'break'
  const [studyMins, setStudyMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [subject, setSubject] = useState('');
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [distractions, setDistractions] = useState({});
  const [todayStats, setTodayStats] = useState({ sessions: 0, minutes: 0, subjects: 0 });
  const [chartData, setChartData] = useState([]);
  const [examReadiness, setExamReadiness] = useState(0);

  const timerRef = useRef(null);
  const endTimeRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedExamMode = localStorage.getItem('sysos_examMode') === 'true';
    setExamMode(storedExamMode);
    
    const storedTasks = JSON.parse(localStorage.getItem('sysos_tasks') || '[]');
    setTasks(storedTasks);
    
    const today = new Date().toISOString().split('T')[0];
    const storedDist = JSON.parse(localStorage.getItem(`sysos_dist_${today}`) || '{}');
    setDistractions(storedDist);
    
    updateStats();
    
    const logs = wellnessStore.getRecentLogs(14);
    setExamReadiness(wellnessStore.calculateExamReadiness(logs));
    
    return () => clearInterval(timerRef.current);
  }, []);

  const updateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const sessions = pomodoroStore.getTodaySessions() || [];
    const uniqueSubs = new Set(sessions.map(s => s.subject).filter(Boolean));
    setTodayStats({
      sessions: sessions.length,
      minutes: sessions.reduce((acc, s) => acc + (s.minutes || s.duration || 0), 0),
      subjects: uniqueSubs.size
    });

    const breakdownObj = pomodoroStore.getSubjectBreakdown(14) || {};
    const chartArray = Object.entries(breakdownObj).map(([subject, minutes]) => ({
      subject,
      minutes: Number(minutes) || 0
    }));

    setChartData(chartArray.length > 0 ? chartArray : [
      { subject: 'Math', minutes: 75 },
      { subject: 'Physics', minutes: 50 },
      { subject: 'Chemistry', minutes: 40 },
      { subject: 'Biology', minutes: 25 }
    ]);
  };

  const playBeep = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 800;
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  };

  const handlePhaseComplete = () => {
    playBeep();
    if (phase === 'study') {
      const today = new Date().toISOString().split('T')[0];
      pomodoroStore.logSession(today, subject || 'General Study', studyMins);
      gamificationStore.addXP(25, 'Pomodoro completed');
      
      const evt = new CustomEvent('triggerConfetti');
      window.dispatchEvent(evt);
      
      const toast = document.createElement('div');
      toast.textContent = 'Session complete! +25 XP';
      toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:1rem 2rem;border-radius:8px;z-index:1000;';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      
      setSessionCount(prev => prev + 1);
      setPhase('break');
      setTimeLeft(breakMins * 60);
      updateStats();
    } else {
      setPhase('study');
      setTimeLeft(studyMins * 60);
    }
    setRunning(false);
  };

  useEffect(() => {
    if (running) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      timerRef.current = setInterval(() => {
        const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimeLeft(0);
          handlePhaseComplete();
        } else {
          setTimeLeft(remaining);
        }
      }, 200);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, timeLeft, phase, studyMins, breakMins, subject]); // Note: dependency on handlePhaseComplete logic requires full closure state or carefully tracking. Using refs or current state.

  const toggleTimer = () => {
    setRunning(!running);
  };

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(phase === 'study' ? studyMins * 60 : breakMins * 60);
  };

  const skipPhase = () => {
    setRunning(false);
    handlePhaseComplete();
  };

  const toggleExamMode = () => {
    const newVal = !examMode;
    setExamMode(newVal);
    localStorage.setItem('sysos_examMode', newVal.toString());
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const newTasks = [...tasks, { id: Date.now(), text: newTask, done: false }];
    setTasks(newTasks);
    setNewTask('');
    localStorage.setItem('sysos_tasks', JSON.stringify(newTasks));
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        if (!t.done) gamificationStore.addXP(10, 'Task completed');
        return { ...t, done: !t.done };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem('sysos_tasks', JSON.stringify(updated));
  };

  const logDistraction = (type) => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = (distractions[type] || 0) + 1;
    const newDist = { ...distractions, [type]: newCount };
    setDistractions(newDist);
    localStorage.setItem(`sysos_dist_${today}`, JSON.stringify(newDist));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalTime = phase === 'study' ? studyMins * 60 : breakMins * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDasharray = 2 * Math.PI * 80; // r=80
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;
  const ringColor = phase === 'study' ? '#3b82f6' : '#10b981';
  
  const distTotal = Object.values(distractions).reduce((a,b) => a+b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. Exam Mode Toggle */}
      <div style={{ background: examMode ? '#1e1b4b' : '#f0f9ff', border: `1px solid ${examMode ? '#3730a3' : '#bae6fd'}`, padding: '1rem 2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: examMode ? '#fff' : '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Monitor size={20} /> Exam Mode
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: examMode ? '#a5b4fc' : '#0ea5e9' }}>
            {examMode ? 'Distractions hidden. Deep focus engaged.' : 'Toggle for a distraction-free study environment.'}
          </p>
        </div>
        <button 
          onClick={toggleExamMode}
          style={{ background: examMode ? '#4f46e5' : '#fff', color: examMode ? '#fff' : '#0369a1', border: `1px solid ${examMode ? '#4f46e5' : '#bae6fd'}`, padding: '0.5rem 1.5rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          {examMode ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: examMode ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Timer & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 2. Pomodoro Timer */}
          <div className="pomodoroContainer" style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            
            <input 
              type="text" 
              placeholder="What are you studying?" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontSize: '1rem', background: '#f9fafb' }}
            />

            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }} className="pomodoroRing">
                <circle cx="90" cy="90" r="80" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                <circle 
                  cx="90" cy="90" r="80" 
                  stroke={ringColor} strokeWidth="8" fill="none" 
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.2s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#1f2937', lineHeight: 1 }}>{formatTime(timeLeft)}</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem', fontWeight: 'bold' }}>
                  {phase}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i < (sessionCount % 4) ? '#3b82f6' : '#e5e7eb' }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={toggleTimer} style={{ width: '50px', height: '50px', borderRadius: '50%', background: running ? '#f59e0b' : '#3b82f6', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {running ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
              </button>
              <button onClick={resetTimer} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f3f4f6', color: '#4b5563', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <RotateCcw size={20} />
              </button>
              <button onClick={skipPhase} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f3f4f6', color: '#4b5563', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <SkipForward size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Study</label>
                <input type="number" value={studyMins} onChange={e => {setStudyMins(parseInt(e.target.value) || 25); if(phase==='study') setTimeLeft((parseInt(e.target.value)||25)*60)}} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Break</label>
                <input type="number" value={breakMins} onChange={e => {setBreakMins(parseInt(e.target.value) || 5); if(phase==='break') setTimeLeft((parseInt(e.target.value)||5)*60)}} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
            </div>
          </div>

          {/* 3. Today's Focus Stats */}
          {!examMode && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.5rem' }}>Pomodoros</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{todayStats.sessions || 0}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.5rem' }}>Focus Mins</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{Number.isFinite(Number(todayStats.minutes)) ? Math.round(Number(todayStats.minutes)) : 0}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.5rem' }}>Subjects</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{todayStats.subjects || 0}</div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Planner & Analytics */}
        {!examMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 4. Study Planner */}
            <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} color="#10b981" /> Today's Plan
              </h3>
              
              <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Add a study task..." 
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                />
                <button type="submit" style={{ padding: '0 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <Plus size={20} />
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                    No tasks planned
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={task.done} 
                        onChange={() => toggleTask(task.id)}
                        style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                      />
                      <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#9ca3af' : '#374151' }}>
                        {task.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 5. Study Analytics & 6. Distraction Log */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 2, background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', color: '#4b5563' }}>Subject Focus (14 Days)</h3>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ flex: 1, background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                  <Ban size={16} /> Distraction Log
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>Awareness is the first step.</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Phone Check', 'Social Media', 'Daydreaming', 'YouTube', 'Other'].map(type => (
                    <button 
                      key={type}
                      onClick={() => logDistraction(type)}
                      style={{ padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <span>{type}</span>
                      <span style={{ fontWeight: 'bold' }}>{distractions[type] || 0}</span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#991b1b' }}>
                  Total Today: {distTotal}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
