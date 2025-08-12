/**
 * gamification.test.ts
 * Unit tests for meditation tracking and gamification features
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MeditationTracker } from '../../src/engine/gamification';

// Mock storage
const mockStorage = {
  data: new Map(),
  get(key: string) {
    return this.data.get(key);
  },
  update(key: string, value: any) {
    this.data.set(key, value);
  },
  clear() {
    this.data.clear();
  }
};

describe('MeditationTracker', () => {
  let tracker: MeditationTracker;

  beforeEach(() => {
    mockStorage.clear();
    tracker = new MeditationTracker('test.stats', mockStorage);
  });

  describe('Initial State', () => {
    test('should initialize with default stats', () => {
      const stats = tracker.getStats();
      
      expect(stats.totalXP).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.todaySessionTime).toBe(0);
      expect(stats.totalMeditationTime).toBe(0);
      expect(stats.sessionsToday).toBe(0);
    });

    test('should start at Mindful Rookie level', () => {
      const level = tracker.getCurrentLevel();
      
      expect(level.level).toBe(1);
      expect(level.title).toBe('Mindful Rookie');
      expect(level.icon).toBe('🌱');
    });
  });

  describe('Meditation Session Tracking', () => {
    test('should track hover sessions correctly', async () => {
      // Mock Date.now for consistent timing
      const originalNow = Date.now;
      let currentTime = 1000;
      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
      
      tracker.startHovering();
      currentTime += 5000; // 5 seconds later
      tracker.stopHovering();
      
      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const stats = tracker.getStats();
      expect(stats.todaySessionTime).toBe(5000);
      expect(stats.totalMeditationTime).toBe(5000);
      expect(stats.sessionsToday).toBe(1);
      
      vi.restoreAllMocks();
    });

    test('should ignore very short hover sessions', () => {
      const originalNow = Date.now;
      let currentTime = 1000;
      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
      
      tracker.startHovering();
      currentTime += 2000; // Only 2 seconds
      tracker.stopHovering();
      
      const stats = tracker.getStats();
      expect(stats.todaySessionTime).toBe(0);
      expect(stats.sessionsToday).toBe(0);
      
      vi.restoreAllMocks();
    });

    test('should award XP for completed breathing cycles', () => {
      tracker.startHovering();
      tracker.onBreathingCycleComplete();
      tracker.onBreathingCycleComplete();
      
      const stats = tracker.getStats();
      expect(stats.totalXP).toBe(2);
    });

    test('should not award XP when not hovering', () => {
      tracker.onBreathingCycleComplete();
      
      const stats = tracker.getStats();
      expect(stats.totalXP).toBe(0);
    });
  });

  describe('Level Progression', () => {
    test('should progress to higher levels with more XP', () => {
      // Add enough XP to reach level 2
      for (let i = 0; i < 50; i++) {
        tracker.startHovering();
        tracker.onBreathingCycleComplete();
      }
      
      const level = tracker.getCurrentLevel();
      expect(level.level).toBe(2);
      expect(level.title).toBe('Breathing Novice');
    });

    test('should calculate progress to next level correctly', () => {
      // Add 25 XP (halfway to level 2)
      for (let i = 0; i < 25; i++) {
        tracker.startHovering();
        tracker.onBreathingCycleComplete();
      }
      
      const progress = tracker.getProgressToNextLevel();
      expect(progress.current).toBe(25);
      expect(progress.required).toBe(50);
      expect(progress.percentage).toBe(50);
    });
  });

  describe('Streak Tracking', () => {
    test('should track meditation streaks', () => {
      const originalNow = Date.now;
      const today = new Date();
      vi.spyOn(Date, 'now').mockImplementation(() => today.getTime());
      
      tracker.startHovering();
      setTimeout(() => {
        tracker.stopHovering();
        const stats = tracker.getStats();
        expect(stats.currentStreak).toBe(1);
      }, 4000);
      
      vi.restoreAllMocks();
    });

    test('should provide appropriate streak icons', () => {
      expect(tracker.getStreakIcon()).toBe('○'); // No streak
      
      // Simulate streak by updating the internal stats directly
      // We need to access the private stats, so we'll use a workaround
      const testTracker = tracker as any;
      testTracker.stats.currentStreak = 5;
      expect(tracker.getStreakIcon()).toBe('🌿');
    });
  });

  describe('Formatting and Display', () => {
    test('should format session time correctly', () => {
      expect(tracker.formatSessionTime(45000)).toBe('45s');
      expect(tracker.formatSessionTime(125000)).toBe('2:05');
      expect(tracker.formatSessionTime(3725000)).toBe('1h 2m');
    });

    test('should provide comprehensive gamification display', () => {
      const display = tracker.getGamificationDisplay();
      
      expect(display.primary).toContain('🌱');
      expect(display.primary).toContain('Mindful Rookie');
      expect(display.secondary).toContain('0d');
      expect(display.secondary).toContain('0 XP');
    });
  });

  describe('Data Persistence', () => {
    test('should save and load stats correctly', () => {
      // Add some data
      tracker.startHovering();
      tracker.onBreathingCycleComplete();
      
      // Create new tracker with same storage
      const tracker2 = new MeditationTracker('test.stats', mockStorage);
      const stats = tracker2.getStats();
      
      expect(stats.totalXP).toBe(1);
    });

    test('should reset data when requested', () => {
      // Add some data
      tracker.startHovering();
      tracker.onBreathingCycleComplete();
      
      // Reset
      tracker.reset();
      
      const stats = tracker.getStats();
      expect(stats.totalXP).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });
  });
});
