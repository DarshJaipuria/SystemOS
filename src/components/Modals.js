'use client';

import React from 'react';
import { Gift } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function Modals({
  showImportModal,
  setShowImportModal,
  prevMonthDetails,
  MONTH_NAMES,
  selectedMonth,
  selectedYear,
  handleImportHabits,

  editingHabit,
  setEditingHabit,
  editHabitName,
  setEditHabitName,
  editHabitGoal,
  setEditHabitGoal,
  daysCount,
  handleUpdateHabit,

  showRewardsModal,
  setShowRewardsModal,
  rewardsFormNames,
  setRewardsFormNames,
  handleSaveRewards,

  showClaimModal,
  setShowClaimModal,
  selectedClaimDate,
  selectedClaimedIds,
  setSelectedClaimedIds,
  habits,
  rewards,
  getUnlockedRewards,
  handleSaveClaims,
  openEditRewards
}) {
  return (
    <>
      {/* 1. MODAL: Import Habits */}
      {showImportModal && prevMonthDetails && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Import Habits</h2>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: '1.5' }}>
                You have <strong>{prevMonthDetails.count} habits</strong> tracked in {MONTH_NAMES[prevMonthDetails.month - 1]} {prevMonthDetails.year}.
                Would you like to import them into {MONTH_NAMES[selectedMonth - 1]} {selectedYear}?
              </p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} type="button" onClick={() => setShowImportModal(false)}>
                Skip
              </button>
              <button className={styles.modalBtnConfirm} type="button" onClick={handleImportHabits}>
                Import Habits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: Edit Habit */}
      {editingHabit && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={(e) => { e.preventDefault(); handleUpdateHabit(); }}>
            <h2 className={styles.modalTitle}>Edit Habit</h2>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Habit Name</label>
                <input
                  className={styles.modalInput}
                  type="text"
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Goal Days</label>
                <input
                  className={styles.modalInput}
                  type="number"
                  min="1"
                  max={daysCount}
                  value={editHabitGoal}
                  onChange={(e) => setEditHabitGoal(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} type="button" onClick={() => setEditingHabit(null)}>
                Cancel
              </button>
              <button className={styles.modalBtnConfirm} type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. MODAL: Set/Edit Month's Rewards */}
      {showRewardsModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={(e) => { e.preventDefault(); handleSaveRewards(); }}>
            <h2 className={styles.modalTitle}>Set Month's Rewards</h2>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                Define reward options you can claim this month. You unlock 1 reward selection for every 1/3rd of daily habits completed. These options reset daily, meaning you can claim the same reward on multiple days!
              </p>

              {/* Dotted Container copy template selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', padding: '10px', backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)' }}>📋 Copy templates from:</span>
                <select 
                  style={{ 
                    fontSize: '12px', 
                    padding: '6px 10px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--text-dark)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  defaultValue=""
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [m, y] = val.split('-').map(Number);
                    try {
                      const res = await fetch(`/api/v1/rewards?month=${m}&year=${y}`);
                      const data = await res.json();
                      if (data.rewards && data.rewards.length > 0) {
                        setRewardsFormNames(data.rewards.map(r => r.name));
                      } else {
                        alert(`No rewards templates found in ${MONTH_NAMES[m - 1]} ${y}`);
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error fetching templates');
                    }
                    e.target.value = ''; // reset dropdown
                  }}
                  aria-label="Copy rewards from previous month"
                >
                  <option value="">-- Select past month --</option>
                  {(() => {
                    const options = [];
                    let m = selectedMonth;
                    let y = selectedYear;
                    for (let i = 0; i < 6; i++) {
                      m--;
                      if (m < 1) {
                        m = 12;
                        y--;
                      }
                      options.push({ month: m, year: y, label: `${MONTH_NAMES[m - 1]} ${y}` });
                    }
                    return options.map(opt => (
                      <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
                        {opt.label}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              <div className={styles.rewardsInputList}>
                {rewardsFormNames.map((name, idx) => (
                  <div key={idx} className={styles.rewardsInputItem}>
                    <span className={styles.rewardsInputLabel}>#{idx + 1}</span>
                    <input
                      className={styles.rewardsInput}
                      type="text"
                      placeholder="e.g. Treat meal, gaming time..."
                      value={name}
                      onChange={(e) => {
                        const newNames = [...rewardsFormNames];
                        newNames[idx] = e.target.value;
                        setRewardsFormNames(newNames);
                      }}
                      required
                      aria-label={`Reward option ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className={styles.removeRewardBtn}
                      onClick={() => {
                        if (rewardsFormNames.length <= 1) {
                          alert("You must keep at least 1 reward option.");
                          return;
                        }
                        const newNames = rewardsFormNames.filter((_, i) => i !== idx);
                        setRewardsFormNames(newNames);
                      }}
                      title="Remove reward option"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {rewardsFormNames.length < 10 && (
                <button
                  type="button"
                  className={styles.addRewardInputBtn}
                  onClick={() => setRewardsFormNames([...rewardsFormNames, ''])}
                >
                  + Add Reward Option
                </button>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} type="button" onClick={() => setShowRewardsModal(false)}>
                Cancel
              </button>
              <button className={styles.modalBtnConfirm} type="submit">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MODAL: Claim Daily Rewards */}
      {showClaimModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Gift size={20} style={{ color: 'var(--week3-color)' }} />
                <span>Claim Daily Rewards</span>
              </h2>
              {openEditRewards && (
                <button
                  type="button"
                  onClick={() => {
                    setShowClaimModal(false);
                    openEditRewards();
                  }}
                  style={{
                    background: 'var(--panel-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--accent-primary)',
                    fontWeight: '600'
                  }}
                >
                  ✏️ Edit Reward Options
                </button>
              )}
            </div>
            <div className={styles.modalBody} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-dark)', marginBottom: '8px' }}>
                Date: <strong>{selectedClaimDate}</strong>
              </div>
              {(() => {
                const completedToday = habits.filter(h => h.completions?.some(c => c.date === selectedClaimDate)).length;
                const unlockedLimit = getUnlockedRewards(completedToday);
                return (
                  <>
                    <div style={{ fontSize: '13px', color: 'var(--text-dark)', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                      Habits completed today: <strong>{completedToday}</strong>
                      <br/>
                      Rewards unlocked: <strong style={{ color: 'var(--week3-color)' }}>{unlockedLimit}</strong>
                      <br/>
                      Rewards claimed: <strong>{selectedClaimedIds.length} / {unlockedLimit}</strong>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Select up to {unlockedLimit} reward options to claim for today.
                    </p>

                    <div className={styles.claimsList}>
                      {rewards.map(reward => {
                        const isChecked = selectedClaimedIds.includes(reward.id);
                        const isDisabled = !isChecked && selectedClaimedIds.length >= unlockedLimit;

                        return (
                          <div 
                            key={reward.id} 
                            className={`${styles.claimSelectItem} ${isChecked ? styles.claimSelectChecked : ''} ${isDisabled ? styles.claimSelectDisabled : ''}`}
                            onClick={() => {
                              if (isDisabled) return;
                              if (isChecked) {
                                setSelectedClaimedIds(selectedClaimedIds.filter(id => id !== reward.id));
                              } else {
                                setSelectedClaimedIds([...selectedClaimedIds, reward.id]);
                              }
                            }}
                          >
                            <input
                              className={styles.claimSelectCheckbox}
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              readOnly
                              aria-label={`Claim reward option: ${reward.name}`}
                            />
                            <span className={styles.claimSelectText}>{reward.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={() => setShowClaimModal(false)}>
                Cancel
              </button>
              <button 
                className={styles.modalBtnConfirm} 
                onClick={() => {
                  handleSaveClaims();
                  setShowClaimModal(false);
                }}
              >
                Save Selected Claims
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
