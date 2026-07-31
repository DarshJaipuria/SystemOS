/**
 * Automated Unit Test Suite for SystemOS Shared Business Logic
 * Runs directly in Node.js using ES Modules (.mjs)
 */
import { streakService } from '../src/lib/services/streakService.js';
import { rewardService } from '../src/lib/services/rewardService.js';
import { analyticsService } from '../src/lib/services/analyticsService.js';

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--------------------------------------------------');
console.log('🧪 Running SystemOS Business Logic Unit Tests...');
console.log('--------------------------------------------------');

// --- 1. Streak calculations tests ---
console.log('\n🏃 Testing Streak Calculations...');

const emptyCompletions = [];
assert(streakService.calculateLongestStreak(emptyCompletions) === 0, 'Empty completions should return longest streak of 0');
assert(streakService.calculateCurrentStreak(emptyCompletions) === 0, 'Empty completions should return current streak of 0');

const singleCompletion = ['2026-06-25'];
assert(streakService.calculateLongestStreak(singleCompletion) === 1, 'Single completion should return longest streak of 1');

// Consecutive streak
const consecutiveCompletions = ['2026-06-25', '2026-06-26', '2026-06-27'];
assert(streakService.calculateLongestStreak(consecutiveCompletions) === 3, 'Consecutive completions should return longest streak of 3');

// Gap in streak
const gapCompletions = ['2026-06-21', '2026-06-22', '2026-06-25', '2026-06-26'];
assert(streakService.calculateLongestStreak(gapCompletions) === 2, 'Gap completions should return longest streak of 2');

// Current streak (ending today or yesterday)
const todayStr = new Date().toISOString().split('T')[0];
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const activeStreakToday = [yesterdayStr, todayStr];
assert(streakService.calculateCurrentStreak(activeStreakToday) === 2, 'Completions today and yesterday should return active streak of 2');

const brokenStreak = ['2026-06-01', '2026-06-02'];
assert(streakService.calculateCurrentStreak(brokenStreak) === 0, 'Old completions should return active streak of 0');


// --- 2. Reward unlocking threshold tests ---
console.log('\n🎁 Testing Reward Unlock Calculations...');
// Ratio: 1 reward for every 1/3rd of the total daily habits. Max templates = 5.
// For 3 habits, 1/3rd = 1 task per reward.
assert(rewardService.getUnlockedRewardsLimit(0, 3, 5) === 0, '0/3 habits completed unlocks 0 rewards');
assert(rewardService.getUnlockedRewardsLimit(1, 3, 5) === 1, '1/3 habits completed unlocks 1 reward');
assert(rewardService.getUnlockedRewardsLimit(2, 3, 5) === 2, '2/3 habits completed unlocks 2 rewards');
assert(rewardService.getUnlockedRewardsLimit(3, 3, 5) === 3, '3/3 habits completed unlocks 3 rewards');

// Edge cases
assert(rewardService.getUnlockedRewardsLimit(5, 3, 5) === 5, 'Completions exceeding total habits capped at max templates');
assert(rewardService.getUnlockedRewardsLimit(1, 0, 5) === 0, '0 daily habits should return 0 rewards unlocked');


// --- 3. Analytics percentage tests ---
console.log('\n📊 Testing Analytics Computations...');

const weeklyTasks = [
  { id: '1', name: 'Task 1', completed: true },
  { id: '2', name: 'Task 2', completed: false },
  { id: '3', name: 'Task 3', completed: true },
  { id: '4', name: 'Task 4', completed: false }
];
assert(analyticsService.calculateWeeklyChecklistPercent(weeklyTasks) === 50, '2/4 completed weekly habits should return 50%');

const emptyWeekly = [];
assert(analyticsService.calculateWeeklyChecklistPercent(emptyWeekly) === 0, 'Empty weekly checklist should return 0%');

const monthlyTasks = [
  { id: '1', name: 'Objective 1', completed: true },
  { id: '2', name: 'Objective 2', completed: true },
  { id: '3', name: 'Objective 3', completed: true }
];
assert(analyticsService.calculateMonthlyChecklistPercent(monthlyTasks) === 100, '3/3 completed monthly habits should return 100%');

console.log('\n--------------------------------------------------');
if (failures === 0) {
  console.log('🎉 SUCCESS: All tests passed successfully!');
  process.exit(0);
} else {
  console.error(`💥 FAILURE: ${failures} tests failed!`);
  process.exit(1);
}
