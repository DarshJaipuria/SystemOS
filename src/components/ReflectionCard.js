'use client';

import React from 'react';
import styles from '@/app/page.module.css';

export default function ReflectionCard({
  reflection,
  reflectionText,
  onReflectionChange,
  onUploadImage
}) {
  return (
    <div className={styles.reflectionCard}>
      <div className={styles.reflectionHeader}>Monthly Reflection</div>
      <div className={styles.reflectionBody}>
        <textarea
          className={styles.reflectionTextarea}
          value={reflectionText}
          onChange={onReflectionChange}
          placeholder="Jot down your reflection, achievements, lessons, and thoughts for the month..."
        />
        <div className={styles.reflectionImageFrame}>
          <img 
            className={styles.reflectionImage} 
            src={reflection?.imageUrl || "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop&q=80"} 
            alt="Reflection journal photo"
          />
          <button 
            className={styles.reflectionImageInput}
            onClick={onUploadImage}
          >
            Change Photo
          </button>
        </div>
      </div>
    </div>
  );
}
