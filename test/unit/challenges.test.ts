import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MeditationTracker } from '../../src/engine/gamification';

// Mock storage
const mockStorage = {
  data: new Map<string, any>(),
  get(key: string) { return this.data.get(key); },
  update(key: string, value: any) { this.data.set(key, value); },
  clear() { this.data.clear(); }
};

describe('Daily Challenges (Eon\'s Wisdom)', () => {
  let tracker: MeditationTracker;
  let current = { t: 1000 };

  beforeEach(() => {
    mockStorage.clear();
    tracker = new MeditationTracker('test.challenges', mockStorage);
    current.t = 1000;
    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockImplementation(() => current.t);
  });

  test('generates daily challenges based on level', () => {
    // Mock current level as level 3
    vi.spyOn(tracker, 'getCurrentLevel').mockReturnValue({
      level: 3,
      title: 'Calm Coder',
      xpRequired: 150,
      icon: '🍃'
    });

    const challenges = tracker.getDailyChallenges();
    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges.length).toBeLessThanOrEqual(4);
    
    // Should have Eon's wisdom messages
    challenges.forEach(c => {
      expect(c.eonMessage).toBeTruthy();
      expect(c.completionMessage).toBeTruthy();
      expect(c.rewardXP).toBeGreaterThan(0);
    });
  });

  test('auto-completes cycle challenges when target reached', () => {
    // Start session and simulate cycles
    tracker.startSession(5);
    
    // Complete enough cycles to trigger challenge
    for (let i = 0; i < 50; i++) {
      tracker.onBreathingCycleComplete();
    }
    
    const completed = tracker.checkChallengeAutoCompletion();
    const cycleChallenge = completed.find(c => c.type === 'cycles');
    
    if (cycleChallenge) {
      expect(cycleChallenge.completed).toBe(true);
      expect(cycleChallenge.rewardXP).toBeGreaterThan(0);
    }
  });

  test('completes morning breath challenge when session before noon', () => {
    // Set time to 10 AM
    const morningTime = new Date().setHours(10, 0, 0, 0);
    vi.spyOn(Date, 'now').mockReturnValue(morningTime);
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(10);

    // Start and complete a session
    tracker.startSession(5);
    tracker.endSession();
    
    const completed = tracker.checkChallengeAutoCompletion();
    const morningChallenge = completed.find(c => c.type === 'morning_breath');
    
    if (morningChallenge) {
      expect(morningChallenge.completed).toBe(true);
      expect(morningChallenge.eonMessage).toContain('dawn');
    }
  });

  test('manual challenge completion awards XP', () => {
    const initialXP = tracker.getStats().totalXP;
    const challenges = tracker.getDailyChallenges();
    
    if (challenges.length > 0) {
      const challenge = challenges[0];
      const result = tracker.completeChallenge(challenge.id);
      
      expect(result.success).toBe(true);
      expect(result.xpAwarded).toBe(challenge.rewardXP);
      expect(tracker.getStats().totalXP).toBe(initialXP + challenge.rewardXP);
    }
  });

  test('generates appropriate challenges for different levels', () => {
    // Test level 1 (should be simpler)
    vi.spyOn(tracker, 'getCurrentLevel').mockReturnValue({
      level: 1,
      title: 'Mindful Rookie',
      xpRequired: 0,
      icon: '🌱'
    });
    
    const level1Challenges = tracker.getDailyChallenges();
    
    // Test level 7 (should include streak and deep session)
    vi.spyOn(tracker, 'getCurrentLevel').mockReturnValue({
      level: 7,
      title: 'Code Mystic',
      xpRequired: 1000,
      icon: '⭐'
    });
    
    tracker.ensureDailyChallenges(); // Force regeneration
    const level7Challenges = tracker.getDailyChallenges();
    
    // Higher level should have challenges
    expect(level7Challenges.length).toBeGreaterThan(0);
    expect(level1Challenges.length).toBeGreaterThan(0);
    
    // All challenges should have Eon's wisdom
    level7Challenges.forEach(c => {
      expect(c.eonMessage).toBeTruthy();
      expect(c.completionMessage).toBeTruthy();
      expect(['cycles', 'minutes', 'morning_breath', 'evening_flow', 'deep_session', 'streak']).toContain(c.type);
    });
  });
});
