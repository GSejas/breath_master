import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MeditationTracker } from '../../src/engine/gamification';

// Reuse simple in-memory storage mock
const mockStorage = {
  data: new Map<string, any>(),
  get(key: string) { return this.data.get(key); },
  update(key: string, value: any) { this.data.set(key, value); },
  clear() { this.data.clear(); }
};

describe('Progress & pledge state (tooltip backing data)', () => {
  let tracker: MeditationTracker;

  beforeEach(() => {
    mockStorage.clear();
    tracker = new MeditationTracker('test.progress', mockStorage);
  });

  test('progress to next level increases with cycles inside a running session', () => {
    // Level 2 at 50 XP. Start a session so cycles grant XP.
    const goal = tracker.getGoalOptions().defaultMinutes;
    const startRes = tracker.startSession(goal);
    expect(startRes.started).toBe(true);
    for (let i = 0; i < 10; i++) {
      tracker.onBreathingCycleComplete();
    }
    const progress = tracker.getProgressToNextLevel();
    expect(progress.current).toBe(10); // 10 XP earned
    expect(progress.required).toBe(50); // 0 -> 50 for level 2
    expect(progress.percentage).toBe(20); // 10/50 = 20%
  });

  test('pledge completion toggles completed flag when honored', () => {
    const pledgeRes = tracker.makePledge(1, 1.15); // 1 minute pledge
    expect(pledgeRes.ok).toBe(true);
    tracker.startSession(1);
    // Simulate 1 minute active time by manipulating internals
    // We cannot access internals directly; simulate by setting Date.now mocking
    const nowSpy = vi.spyOn(Date, 'now');
    const base = Date.now();
    nowSpy.mockReturnValue(base + 60_000); // add one minute
    const rec = tracker.endSession();
    expect(rec?.pledgeHonored).toBe(true);
    // Active pledge should be marked completed
    const activePledge = (tracker as any).getActivePledge?.();
    expect(activePledge?.completed).toBe(true);
    nowSpy.mockRestore();
  });
});
