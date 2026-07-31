// FILE: src/components/shared/ScoreRing.js
'use client';

import React, { useEffect, useState } from 'react';

export default function ScoreRing({ score = 0, size = 80, strokeWidth = 8, label = '', showValue = true }) {
  const safeScore = Number.isFinite(Number(score)) ? Math.max(0, Math.min(100, Math.round(Number(score)))) : 0;
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentScore(safeScore);
    }, 100);
    return () => clearTimeout(timeout);
  }, [safeScore]);

  const displayScore = Number.isFinite(Number(currentScore)) ? Math.max(0, Math.min(100, Math.round(Number(currentScore)))) : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  let color = 'var(--accent-green)';
  if (safeScore < 40) color = 'var(--accent-red)';
  else if (safeScore <= 70) color = 'var(--accent-amber)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--bg-secondary, #e2e8f0)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            strokeLinecap="round"
          />
        </svg>
        {showValue && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: size * 0.25,
            color: 'var(--text-primary, #0f172a)'
          }}>
            {displayScore}
          </div>
        )}
      </div>
      {label && <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>{label}</span>}
    </div>
  );
}
