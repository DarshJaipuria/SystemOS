'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function AffirmationBar({ affirmationText, setAffirmationText, onSaveAffirmation }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSaveAffirmation(affirmationText);
      e.target.blur();
    }
  };

  return (
    <div className={styles.affirmationBar}>
      <div className={styles.affirmationIcon}>
        <Sparkles size={16} />
      </div>
      <input
        type="text"
        className={styles.affirmationInput}
        value={affirmationText}
        onChange={(e) => setAffirmationText(e.target.value)}
        onBlur={() => onSaveAffirmation(affirmationText)}
        onKeyDown={handleKeyDown}
        placeholder="Set a focal affirmation for this month (e.g. 'I am intentional, grounded, and present...')"
        aria-label="Monthly Affirmation"
      />
    </div>
  );
}
