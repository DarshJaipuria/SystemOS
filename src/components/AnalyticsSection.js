'use client';

import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import styles from '@/app/page.module.css';

export default function AnalyticsSection({ chartData, theme, mounted = true, weekStats }) {
  const getWeekColor = (dayNum) => {
    if (dayNum <= 7) return '#719ac6';
    if (dayNum <= 14) return '#d7768a';
    if (dayNum <= 21) return '#559e7e';
    if (dayNum <= 28) return '#c99335';
    return '#7b75b3';
  };

  const weekColors = [
    '#719ac6', // week 1
    '#d7768a', // week 2
    '#559e7e', // week 3
    '#c99335', // week 4
    '#7b75b3'  // week 5
  ];

  return (
    <div className={styles.centerPanel}>
      {/* Analytics Charts */}
      <div className={styles.analyticsCard}>
        {mounted ? (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#8bb3e0' : '#b0cbe8'} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#8bb3e0' : '#b0cbe8'} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" scale="band" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: theme === 'dark' ? '#aba29e' : '#8c8581' }} />
                <YAxis width={30} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: theme === 'dark' ? '#aba29e' : '#8c8581' }} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? 'rgba(59,56,54,0.4)' : 'rgba(240,237,230,0.4)' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#232120' : '#ffffff', 
                    borderColor: theme === 'dark' ? 'rgba(74, 70, 67, 0.6)' : 'rgba(229, 224, 216, 0.6)', 
                    borderRadius: '8px' 
                  }} 
                  itemStyle={{ color: theme === 'dark' ? '#faf9f6' : '#2b2827' }} 
                  labelStyle={{ color: theme === 'dark' ? '#aba29e' : '#8c8581' }}
                />
                <Area type="monotone" dataKey="completions" stroke={theme === 'dark' ? '#8bb3e0' : '#719ac6'} strokeWidth={2} fillOpacity={1} fill="url(#colorCompletions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
        )}

        {/* Custom Bar chart color-coded by week */}
        {mounted && (
          <div className={styles.chartContainer} style={{ height: '50px', marginTop: '5px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" scale="band" hide={true} />
                <YAxis width={30} tickLine={false} axisLine={false} tick={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#232120' : '#ffffff', 
                    borderColor: theme === 'dark' ? 'rgba(74, 70, 67, 0.6)' : 'rgba(229, 224, 216, 0.6)', 
                    borderRadius: '8px' 
                  }} 
                  itemStyle={{ color: theme === 'dark' ? '#faf9f6' : '#2b2827' }} 
                  labelStyle={{ color: theme === 'dark' ? '#aba29e' : '#8c8581' }}
                />
                <Bar dataKey="completions" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getWeekColor(entry.day)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Week Completion Doughnut Gauges */}
      <div className={styles.weekGaugesRow}>
        {[1, 2, 3, 4, 5].map(weekIndex => {
          const stats = weekStats[weekIndex - 1] || { percent: 0, count: 0, total: 0 };
          const color = weekColors[weekIndex - 1];
          const percent = stats.percent;

          return (
            <div key={weekIndex} className={styles.weekGaugeItem}>
              <span className={styles.weekGaugeLabel}>week {weekIndex}</span>
              
              {/* SVG circular progress ring */}
              <svg className={styles.circularProgress} width="90" height="90" viewBox="0 0 36 36">
                <path
                  className={styles.circularProgressBg}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.circularProgressFill}
                  style={{ stroke: color }}
                  strokeDasharray={`${percent}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.5" textAnchor="middle" className={styles.circularProgressValText}>
                  {percent}%
                </text>
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
