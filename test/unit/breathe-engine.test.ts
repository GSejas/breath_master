import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BreatheEngine, Pattern } from '../../src/engine/breathe-engine';

describe('BreatheEngine', () => {
  let engine: BreatheEngine;
  let mockDate: any;

  beforeEach(() => {
    // Mock Date.now() for deterministic testing
    mockDate = vi.spyOn(Date, 'now');
    mockDate.mockReturnValue(0); // Start at time 0
    engine = new BreatheEngine('chill');
  });

  describe('Pattern Management', () => {
    it('should initialize with default chill pattern', () => {
      const engine = new BreatheEngine();
      expect(engine.pattern).toBe('chill');
    });

    it('should accept all valid patterns', () => {
      const patterns: Pattern[] = ['chill', 'medium', 'active', 'boxing', 'relaxing'];
      
      patterns.forEach(pattern => {
        const engine = new BreatheEngine(pattern);
        expect(engine.pattern).toBe(pattern);
      });
    });

    it('should change pattern and reset cycle', () => {
      engine.setPattern('boxing');
      expect(engine.pattern).toBe('boxing');
      expect(engine.totalDuration).toBe(16000); // 4+4+4+4 seconds
    });
  });

  describe('Duration Calculations', () => {
    it('should calculate correct total duration for each pattern', () => {
      const expectedDurations = {
        chill: 14000,    // 6s + 0s + 8s + 0s
        medium: 10000,   // 5s + 0s + 5s + 0s
        active: 11000,   // 4s + 2s + 4s + 1s
        boxing: 16000,   // 4s + 4s + 4s + 4s
        relaxing: 19000  // 4s + 7s + 8s + 0s
      };

      Object.entries(expectedDurations).forEach(([pattern, duration]) => {
        engine.setPattern(pattern as Pattern);
        expect(engine.totalDuration).toBe(duration);
      });
    });
  });

  describe('Amplitude Calculation', () => {
    beforeEach(() => {
      engine.setPattern('boxing'); // 4-4-4-4 pattern for predictable testing
    });

    it('should start at 0 amplitude at beginning of cycle', () => {
      mockDate.mockReturnValue(0);
      expect(engine.getAmplitude()).toBeCloseTo(0, 2);
    });

    it('should reach peak amplitude at end of inhale phase', () => {
      mockDate.mockReturnValue(4000); // End of 4s inhale
      expect(engine.getAmplitude()).toBeCloseTo(1, 2);
    });

    it('should maintain peak amplitude during hold1 phase', () => {
      mockDate.mockReturnValue(6000); // Middle of hold1 (4s-8s)
      expect(engine.getAmplitude()).toBe(1);
    });

    it('should return to 0 amplitude at end of exhale phase', () => {
      mockDate.mockReturnValue(12000); // End of exhale (8s-12s)
      expect(engine.getAmplitude()).toBeCloseTo(0, 2);
    });

    it('should stay at 0 during hold2 phase', () => {
      mockDate.mockReturnValue(14000); // Middle of hold2 (12s-16s)
      expect(engine.getAmplitude()).toBe(0);
    });

    it('should cycle properly - restart at 0 after full cycle', () => {
      mockDate.mockReturnValue(16000); // Exactly one full cycle
      expect(engine.getAmplitude()).toBeCloseTo(0, 2);
    });

    it('should handle mid-inhale amplitude with raised cosine curve', () => {
      mockDate.mockReturnValue(2000); // Middle of 4s inhale
      const amplitude = engine.getAmplitude();
      expect(amplitude).toBeGreaterThan(0);
      expect(amplitude).toBeLessThan(1);
      expect(amplitude).toBeCloseTo(0.5, 1); // Should be around 0.5 at middle
    });
  });

  describe('Phase Detection', () => {
    beforeEach(() => {
      engine.setPattern('boxing'); // 4-4-4-4 pattern
    });

    it('should detect inhale phase correctly', () => {
      mockDate.mockReturnValue(2000); // 2s into cycle
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Inhale');
      expect(phase.remainingSeconds).toBe(2); // 2s remaining in 4s inhale
    });

    it('should detect first hold phase correctly', () => {
      mockDate.mockReturnValue(6000); // 6s into cycle (2s into hold1)
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Hold');
      expect(phase.remainingSeconds).toBe(2); // 2s remaining in hold1
    });

    it('should detect exhale phase correctly', () => {
      mockDate.mockReturnValue(10000); // 10s into cycle (2s into exhale)
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Exhale');
      expect(phase.remainingSeconds).toBe(2); // 2s remaining in 4s exhale
    });

    it('should detect second hold phase correctly', () => {
      mockDate.mockReturnValue(14000); // 14s into cycle (2s into hold2)
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Hold');
      expect(phase.remainingSeconds).toBe(2); // 2s remaining in hold2
    });
  });

  describe('Pattern-Specific Behavior', () => {
    it('should handle chill pattern (no holds)', () => {
      engine.setPattern('chill');
      
      // Test exhale phase
      mockDate.mockReturnValue(8000); // 2s into 8s exhale
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Exhale');
      expect(phase.remainingSeconds).toBe(6);
    });

    it('should handle relaxing pattern (4-7-8 technique)', () => {
      engine.setPattern('relaxing');
      
      // Test long hold phase
      mockDate.mockReturnValue(8000); // 4s into 7s hold
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Hold');
      expect(phase.remainingSeconds).toBe(3);
    });

    it('should handle active pattern with short holds', () => {
      engine.setPattern('active');
      
      // Test short hold2
      mockDate.mockReturnValue(10500); // 0.5s into 1s hold2
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Hold');
      expect(phase.remainingSeconds).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle time exactly at phase boundaries', () => {
      engine.setPattern('boxing');
      
      // Exactly at inhale->hold1 boundary
      mockDate.mockReturnValue(4000);
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Hold');
      expect(phase.remainingSeconds).toBe(4);
    });

    it('should handle large time values (multiple cycles)', () => {
      engine.setPattern('boxing'); // 16s cycle
      mockDate.mockReturnValue(32000); // Exactly 2 full cycles
      
      expect(engine.getAmplitude()).toBeCloseTo(0, 2);
      
      const phase = engine.getCurrentPhase();
      expect(phase.phase).toBe('Inhale');
      expect(phase.remainingSeconds).toBe(4);
    });
  });
});
