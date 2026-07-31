// FILE: src/components/Wellness/WellnessTab.js
'use client';

import React, { useState, useEffect } from 'react';
import { wellnessStore } from '@/lib/wellnessStore';
import { recommendationEngine } from '@/lib/recommendationEngine';
import { aiService } from '@/lib/aiService';
import { gamificationStore } from '@/lib/gamificationStore';
import ScoreRing from '@/components/shared/ScoreRing';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Moon, Monitor, BookOpen, Smile, Target, Zap, Droplets, Gamepad2, Brain, Activity, Smartphone } from 'lucide-react';
import styles from '@/app/page.module.css';

const MOODS = ['😢', '🙁', '😐', '🙂', '😄'];

export default function WellnessTab({ user, habits, selectedMonth, selectedYear }) {
  const [formData, setFormData] = useState({
    screenTime: 0,
    socialMedia: 0,
    gaming: 0,
    studyHours: 0,
    sleep: 0,
    water: 0,
    exercise: 0,
    meditation: 0,
    mood: '😐',
    stress: 5,
    energy: 5,
    focus: 5
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(0);
  const [examReadiness, setExamReadiness] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    const log = wellnessStore.getLog(today);
    if (log) {
      setFormData(log);
    }
    
    const logs = wellnessStore.getRecentLogs(7);
    setRecentLogs(logs);
    
    setInsights(wellnessStore.getInsights(logs));
    setHealthScore(wellnessStore.calculateHealthScore(log || formData));
    setExamReadiness(wellnessStore.calculateExamReadinessScore(logs));
    
    const fetchAi = async () => {
      setAiLoading(true);
      try {
        const msg = await aiService.getWellnessAdvice(log || formData);
        setAiMessage(msg);
      } catch (err) {
        setAiMessage("Keep balancing your study and wellness. Drink some water and take short breaks!");
      } finally {
        setAiLoading(false);
      }
    };
    
    fetchAi();
    setRecommendations(recommendationEngine.getRecommendations(log || formData, habits?.map(h => h.name) || []));
  }, [habits]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setHealthScore(wellnessStore.calculateHealthScore(updated));
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    wellnessStore.logWellness(today, formData);
    gamificationStore.addXP(15, 'Wellness logged');
    
    setToastMessage('Wellness logged! +15 XP');
    setTimeout(() => setToastMessage(null), 3000);
    
    const logs = wellnessStore.getRecentLogs(7);
    setRecentLogs(logs);
    setInsights(wellnessStore.getInsights(logs));
    setExamReadiness(wellnessStore.calculateExamReadiness(logs));
    setRecommendations(recommendationEngine.getRecommendations(formData, habits?.map(h => h.name) || []));
  };

  const stressColor = formData.stress <= 4 ? '#22c55e' : formData.stress <= 7 ? '#f59e0b' : '#ef4444';

  const usageData = [
    { name: 'Screen Time', value: formData.screenTime, fill: formData.screenTime > 6 ? '#ef4444' : '#22c55e' },
    { name: 'Social Media', value: formData.socialMedia, fill: formData.socialMedia > 2 ? '#f59e0b' : '#3b82f6' },
    { name: 'Gaming', value: formData.gaming, fill: formData.gaming > 2 ? '#f59e0b' : '#8b5cf6' },
    { name: 'Study', value: formData.studyHours, fill: '#10b981' },
    { name: 'Sleep', value: formData.sleep, fill: formData.sleep < 7 ? '#f59e0b' : '#6366f1' },
    { name: 'Exercise (h)', value: formData.exercise / 60, fill: '#14b8a6' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {toastMessage}
        </div>
      )}

      {/* 1. Today's Wellness Log Form */}
      <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={24} color="#6366f1" /> Today's Wellness Check-in
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Monitor size={16} style={{display:'inline', marginRight:'4px'}}/> Screen Time</span>
              <span>{formData.screenTime ?? 0}h 📱</span>
            </label>
            <input type="range" min="0" max="12" step="0.5" value={formData.screenTime ?? 0} onChange={(e) => handleChange('screenTime', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Smartphone size={16} style={{display:'inline', marginRight:'4px'}}/> Social Media</span>
              <span>{formData.socialMedia ?? 0}h</span>
            </label>
            <input type="range" min="0" max="8" step="0.5" value={formData.socialMedia ?? 0} onChange={(e) => handleChange('socialMedia', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Gamepad2 size={16} style={{display:'inline', marginRight:'4px'}}/> Gaming</span>
              <span>{formData.gaming ?? 0}h</span>
            </label>
            <input type="range" min="0" max="8" step="0.5" value={formData.gaming ?? 0} onChange={(e) => handleChange('gaming', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><BookOpen size={16} style={{display:'inline', marginRight:'4px'}}/> Study Hours</span>
              <span>{formData.studyHours ?? 0}h</span>
            </label>
            <input type="range" min="0" max="12" step="0.5" value={formData.studyHours ?? 0} onChange={(e) => handleChange('studyHours', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Moon size={16} style={{display:'inline', marginRight:'4px'}}/> Sleep</span>
              <span>{formData.sleep ?? 0}h</span>
            </label>
            <input type="range" min="0" max="12" step="0.5" value={formData.sleep ?? 0} onChange={(e) => handleChange('sleep', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />
            <small style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block', marginTop: '0.25rem' }}>7-9h recommended</small>
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Droplets size={16} style={{display:'inline', marginRight:'4px'}}/> Water Glasses</span>
              <span>{formData.water ?? 0} 💧</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => handleChange('water', Math.max(0, (formData.water || 0) - 1))} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--hover-bg, #f3f4f6)', color: 'var(--text-primary, inherit)', cursor: 'pointer' }}>-</button>
              <span style={{ fontSize: '1.25rem' }}>
                {Array.from({ length: Math.min(8, formData.water || 0) }).map((_, i) => '💧').join('')}
                {(formData.water || 0) > 8 ? ` +${(formData.water || 0) - 8} more` : ''}
              </span>
              <button onClick={() => handleChange('water', Math.min(16, (formData.water || 0) + 1))} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--hover-bg, #f3f4f6)', color: 'var(--text-primary, inherit)', cursor: 'pointer' }}>+</button>
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Activity size={16} style={{display:'inline', marginRight:'4px'}}/> Exercise</span>
              <span>{formData.exercise ?? 0} min</span>
            </label>
            <input type="range" min="0" max="120" step="5" value={formData.exercise ?? 0} onChange={(e) => handleChange('exercise', parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Brain size={16} style={{display:'inline', marginRight:'4px'}}/> Meditation</span>
              <span>{formData.meditation ?? 0} min</span>
            </label>
            <input type="range" min="0" max="60" step="5" value={formData.meditation ?? 0} onChange={(e) => handleChange('meditation', parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Smile size={16} style={{display:'inline', marginRight:'4px'}}/> Mood</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {MOODS.map(m => (
                <button 
                  key={m} 
                  onClick={() => handleChange('mood', m)}
                  style={{ 
                    fontSize: '1.5rem', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    transform: formData.mood === m ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.2s',
                    opacity: formData.mood === m ? 1 : 0.5
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Zap size={16} style={{display:'inline', marginRight:'4px'}}/> Stress</span>
              <span>{formData.stress ?? 5}/10</span>
            </label>
            <input type="range" min="1" max="10" step="1" value={formData.stress ?? 5} onChange={(e) => handleChange('stress', parseInt(e.target.value) || 5)} style={{ width: '100%', accentColor: stressColor }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Zap size={16} style={{display:'inline', marginRight:'4px'}}/> Energy</span>
              <span>{formData.energy ?? 5}/10</span>
            </label>
            <input type="range" min="1" max="10" step="1" value={formData.energy ?? 5} onChange={(e) => handleChange('energy', parseInt(e.target.value) || 5)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span><Target size={16} style={{display:'inline', marginRight:'4px'}}/> Focus</span>
              <span>{formData.focus ?? 5}/10</span>
            </label>
            <input type="range" min="1" max="10" step="1" value={formData.focus ?? 5} onChange={(e) => handleChange('focus', parseInt(e.target.value) || 5)} style={{ width: '100%' }} />
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleSave}
            style={{ padding: '0.75rem 2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(99,102,241,0.2)' }}
          >
            Save Wellness Log
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* 2. Student Health Score */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Student Health Score</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <ScoreRing score={healthScore} size={140} color={healthScore > 80 ? '#10b981' : healthScore > 60 ? '#f59e0b' : '#ef4444'} />
              <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recentLogs.slice().reverse()}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#c7d2fe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Sleep', val: Math.min(100, ((formData.sleep || 0) / 8) * 100), max: 20 },
                { label: 'Study', val: Math.min(100, ((formData.studyHours || 0) / 6) * 100), max: 20 },
                { label: 'Exercise', val: Math.min(100, ((formData.exercise || 0) / 60) * 100), max: 15 },
                { label: 'Hydration', val: Math.min(100, ((formData.water || 0) / 8) * 100), max: 15 },
                { label: 'Mood/Stress', val: Math.max(0, 100 - ((formData.stress || 5) * 10)), max: 15 },
                { label: 'Screen Time', val: Math.max(0, 100 - (((formData.screenTime || 0) + (formData.socialMedia || 0)) * 5)), max: 15 }
              ].map(metric => (
                <div key={metric.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span>{metric.label}</span>
                    <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>Max {metric.max} pts</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--hover-bg, #e5e7eb)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metric.val}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Exam Readiness Score */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="examCard">
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={20} color="#8b5cf6" /> Exam Readiness Score
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: (examReadiness || 0) > 80 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>
              {Number.isFinite(Number(examReadiness)) ? Math.round(Number(examReadiness)) : 0}
            </div>
            <div style={{ color: 'var(--text-secondary, #94a3b8)' }}>/ 100</div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color, #e5e7eb)', borderBottom: '1px solid var(--border-color, #e5e7eb)', padding: '1rem 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Study streak</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>5 days 🔥</div>
            </div>
            <div style={{ width: '1px', background: '#e5e7eb' }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Avg sleep this week</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {(recentLogs.reduce((acc, l) => acc + (l.sleep || 0), 0) / Math.max(1, recentLogs.length)).toFixed(1)}h 😴
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {insights.map((insight, idx) => (
              <div key={idx} className="examInsight" style={{ background: '#f3f4f6', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#6366f1', marginTop: '2px' }}>💡</span>
                {insight}
              </div>
            ))}
            {insights.length === 0 && (
              <div className="examInsight" style={{ background: '#f3f4f6', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#6b7280' }}>
                Log more days to get personalized exam readiness insights!
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* 4. AI Wellness Coach */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smile size={20} color="#14b8a6" /> Aria, Your Wellness Coach
          </h3>
          
          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1.5rem', borderRadius: '8px', position: 'relative' }}>
            {aiLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', width: '90%', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '1rem', color: '#0f766e', lineHeight: 1.5 }}>
                "{aiMessage}"
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>Recommended for you today:</h4>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="recoCard" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  {rec.emoji || '✨'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{rec.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{rec.reason}</div>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                Log your wellness to get personalized recommendations!
              </div>
            )}
          </div>
        </div>

        {/* 5. Digital Usage Breakdown */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Monitor size={20} color="#3b82f6" /> Time Allocation Today
          </h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" unit="h" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
    </div>
  );
}
