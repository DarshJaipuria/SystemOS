// FILE: src/components/shared/SkeletonCard.js
'use client';

import React from 'react';

export default function SkeletonCard({ width = '100%', height = '100%', borderRadius = '16px' }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
    />
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: '16px',
            borderRadius: '4px',
            width: i === lines - 1 ? '60%' : '100%'
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }) {
  return (
    <div
      className="skeleton"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%'
      }}
    />
  );
}
