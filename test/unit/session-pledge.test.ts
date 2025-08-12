import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MeditationTracker } from '../../src/engine/gamification';

// Mock storage identical to existing pattern
const mockStorage = {
  data: new Map<string, any>(),
  get(key: string) { return this.data.get(key); },
  update(key: string, value: any) { this.data.set(key, value); },
  clear() { this.data.clear(); }
};

function advance(ms: number, current: { t: number }) {
  current.t += ms;
}

describe('Sessions & Pledges (happy path)', () => {
  let tracker: MeditationTracker;
  let current = { t: 1000 };

  beforeEach(() => {
    mockStorage.clear();
    tracker = new MeditationTracker('test.sessions', mockStorage);
    current.t = 1000;
    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockImplementation(() => current.t);
  });

  test('start → pause → resume → end session with goal', () => {
    const goal = tracker.getGoalOptions().defaultMinutes; // should be 5 at level 1
    const startRes = tracker.startSession(goal);
    expect(startRes.started).toBe(true);

    // Simulate 2 minutes active
    advance(2 * 60 * 1000, current);
    tracker.pauseSession();

    const midSession = tracker.getActiveSession();
    expect(midSession?.accumulatedActiveMs).toBe(2 * 60 * 1000);
    expect(midSession?.state).toBe('paused');

    // Resume and add 3 more minutes
    tracker.resumeSession();
    advance(3 * 60 * 1000, current);

    const record = tracker.endSession();
    expect(record).not.toBeNull();
    expect(record?.goalMinutes).toBe(goal);
    // Total active ~5 minutes
    expect(record?.activeMs).toBeGreaterThanOrEqual(5 * 60 * 1000);
    // Bonus XP computed proportionally or full if >= goal
    expect((record?.goalBonusXP ?? 0)).toBeGreaterThan(0);
  });

  test('pledge honored when goal fully met', () => {
    const goal = 3; // pick smallest for speed
    const pledge = tracker.makePledge(goal, 1.15);
    expect(pledge.ok).toBe(true);

    tracker.startSession(goal);
    // Advance full goal minutes
    advance(goal * 60 * 1000, current);
    const record = tracker.endSession();
    expect(record?.pledgeHonored).toBe(true);
  });

  test('cannot create second pledge while active', () => {
    tracker.makePledge(5, 1.15);
    const second = tracker.makePledge(5, 1.15);
    expect(second.ok).toBe(false);
  });
});
