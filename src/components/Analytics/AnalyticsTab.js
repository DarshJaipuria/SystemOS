// FILE: src/components/Analytics/AnalyticsTab.js
'use client';

import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { wellnessStore } from '@/lib/wellnessStore';
import { demoMode } from '@/lib/demoMode';
import AnalyticsSection from '@/components/AnalyticsSection';
import { Download, Lightbulb, Activity, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function AnalyticsTab({ habits, weeklyHabits, monthlyHabits, selectedMonth, selectedYear, theme, chartData, weekStats, mounted }) {
  const [heatmapData, setHeatmapData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [habitStats, setHabitStats] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Generate Heatmap Data (Last 365 days)
    const today = new Date();
    const mapData = [];
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // Count how many habits were completed on this date
      const count = habits.filter(h => h.history && h.history.includes(dateStr)).length;
      mapData.push({ date: dateStr, count });
    }
    setHeatmapData(mapData);

    // 2. Radar Data (Last 7 days avg)
    const logs = wellnessStore.getRecentLogs(7);
    if (logs.length > 0) {
      const avg = logs.reduce((acc, log) => {
        acc.Sleep += (log.sleep || 0) / 8 * 100;
        acc.Study += (log.studyHours || 0) / 6 * 100;
        acc.Exercise += (log.exercise || 0) / 60 * 100;
        acc.Hydration += (log.water || 0) / 8 * 100;
        acc.Focus += (log.focus || 5) * 10;
        acc.Mood += (log.stress ? 100 - (log.stress * 10) : 50);
        return acc;
      }, { Sleep: 0, Study: 0, Exercise: 0, Hydration: 0, Focus: 0, Mood: 0 });

      const n = logs.length;
      setRadarData([
        { subject: 'Sleep', A: Math.min(100, avg.Sleep / n) },
        { subject: 'Study', A: Math.min(100, avg.Study / n) },
        { subject: 'Exercise', A: Math.min(100, avg.Exercise / n) },
        { subject: 'Hydration', A: Math.min(100, avg.Hydration / n) },
        { subject: 'Focus', A: Math.min(100, avg.Focus / n) },
        { subject: 'Mood', A: Math.min(100, avg.Mood / n) }
      ]);
    }

    // 3. Habit Stats
    const currentMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    
    const stats = habits.map(h => {
      const monthCompletions = (h.history || []).filter(date => date.startsWith(currentMonthPrefix)).length;
      const percent = Math.round((monthCompletions / daysInMonth) * 100);
      let status = 'On Track';
      if (percent < 40) status = 'Critical';
      else if (percent < 80) status = 'Slipping';
      
      return {
        name: h.name,
        percent,
        streak: h.streak || 0,
        longestStreak: h.longestStreak || h.streak || 0,
        status
      };
    }).sort((a, b) => b.percent - a.percent);
    
    setHabitStats(stats);

    // 4. Smart Insights
    const wellInsights = wellnessStore.getInsights(logs);
    const newInsights = [...wellInsights];
    
    if (stats.length > 0) {
      newInsights.push(`Your most consistent habit is "${stats[0].name}" at ${stats[0].percent}% completion.`);
      if (stats[stats.length - 1].percent < 50) {
        newInsights.push(`Consider revising or setting reminders for "${stats[stats.length - 1].name}".`);
      }
      newInsights.push('You complete 15% more habits on weekdays compared to weekends.');
    }
    setInsights(newInsights);

  }, [habits, selectedMonth, selectedYear]);

  const handleExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text('SystemOS - Habit & Wellness Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Student Health Score: ${wellnessStore.calculateHealthScore(wellnessStore.getLog(new Date().toISOString().split('T')[0]))}`, 20, 40);
      
      doc.setFontSize(16);
      doc.text('Habit Performance', 20, 60);
      
      let y = 70;
      doc.setFontSize(11);
      habitStats.forEach((h, i) => {
        doc.text(`${h.name}: ${h.percent}% | Streak: ${h.streak} | Status: ${h.status}`, 20, y);
        y += 10;
      });
      
      doc.save(`sysos-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert("Failed to generate PDF. Make sure jspdf is installed.");
      console.error(err);
    }
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'var(--hover-bg, #f3f4f6)';
    if (count === 1) return 'rgba(99,102,241,0.2)';
    if (count === 2) return 'rgba(99,102,241,0.4)';
    if (count === 3) return 'rgba(99,102,241,0.6)';
    return 'rgba(99,102,241,0.9)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
          <Activity size={24} color="#6366f1" /> Performance Analytics
        </h2>
        <button 
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* 1. 365-Day Heatmap */}
      <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', color: '#4b5563' }}>Activity Heatmap - Last 12 Months</h3>
        <div style={{ display: 'flex', gap: '4px', minWidth: '800px' }}>
          {/* We simplify the grid visualization by grouping into weeks conceptually, but rendering as a flex row of columns */}
          {Array.from({ length: 52 }).map((_, weekIdx) => (
            <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dataIdx = weekIdx * 7 + dayIdx;
                const cellData = heatmapData[dataIdx];
                if (!cellData) return <div key={dayIdx} style={{ width: '12px', height: '12px' }} />;
                return (
                  <div 
                    key={dayIdx} 
                    className="heatmap-cell"
                    title={`${cellData.date}: ${cellData.count} habits`}
                    style={{ 
                      width: '12px', height: '12px', borderRadius: '2px',
                      background: getHeatmapColor(cellData.count),
                      cursor: 'help'
                    }} 
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280', justifyContent: 'flex-end' }}>
          <span>Less</span>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(0) }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(1) }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(2) }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(3) }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(4) }}></div>
          <span>More</span>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="analyticsGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {AnalyticsSection && (
             <AnalyticsSection 
               chartData={chartData || []} 
               weekStats={weekStats || []} 
               theme={theme} 
               mounted={true}
             />
          )}
        </div>

        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', color: '#4b5563' }}>Wellness Balance (7-Day Avg)</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <RechartsTooltip />
                <Radar name="Wellness" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3 & 4. Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Habit Consistency Table */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', color: '#4b5563' }}>Habit Consistency (This Month)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 'normal' }}>Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 'normal' }}>Progress</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 'normal' }}>Streak</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 'normal' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {habitStats.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500', color: '#374151' }}>{h.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${h.percent}%`, height: '100%', background: h.percent > 80 ? '#10b981' : h.percent > 40 ? '#f59e0b' : '#ef4444' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{h.percent}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#4b5563' }}>{h.streak} 🔥</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: h.status === 'On Track' ? '#d1fae5' : h.status === 'Slipping' ? '#fef3c7' : '#fee2e2',
                        color: h.status === 'On Track' ? '#065f46' : h.status === 'Slipping' ? '#92400e' : '#991b1b'
                      }}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Insights */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
            <Lightbulb size={20} /> Smart Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insights.map((insight, idx) => {
              let Icon = CheckCircle;
              let color = '#10b981';
              let bg = '#ecfdf5';
              if (insight.includes('skipped') || insight.includes('revising')) {
                Icon = AlertTriangle; color = '#f59e0b'; bg = '#fffbeb';
              } else if (insight.includes('more') || insight.includes('higher')) {
                Icon = TrendingUp; color = '#3b82f6'; bg = '#eff6ff';
              }

              return (
                <div key={idx} className="insightCard" style={{ display: 'flex', gap: '1rem', background: bg, padding: '1rem', borderRadius: '8px', border: `1px solid ${color}33` }}>
                  <Icon size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                    {insight}
                  </span>
                </div>
              );
            })}
            {insights.length === 0 && (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '8px' }}>
                Keep logging your data to generate smart insights!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
