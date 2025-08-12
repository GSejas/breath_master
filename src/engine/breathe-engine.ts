/**
 * breathe-engine.ts
 * Pure TypeScript breathing engine with inhale/hold1/exhale/hold2 phases
 * and smooth raised-cosine curve transitions.
 */

export type Pattern = "chill" | "medium" | "active" | "boxing" | "relaxing";

interface PhaseDurations {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

const PATTERNS: Record<Pattern, PhaseDurations> = {
  chill:      { inhale: 6000, hold1: 0,    exhale: 8000, hold2: 0    }, // Slow and easy
  medium:     { inhale: 5000, hold1: 0,    exhale: 5000, hold2: 0    }, // Coherence breathing
  active:     { inhale: 4000, hold1: 2000, exhale: 4000, hold2: 1000 }, // Energizing
  boxing:     { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 }, // Box breathing (tactical)
  relaxing:   { inhale: 4000, hold1: 7000, exhale: 8000, hold2: 0    }  // 4-7-8 technique
};

/**
 * Framework-agnostic breathing engine that generates normalized amplitude [0..1]
 * using raised-cosine easing for smooth inhale/exhale transitions.
 */
export class BreatheEngine {
  private durations: PhaseDurations;
  private startTime: number;

  constructor(public pattern: Pattern = "chill") {
    this.durations = PATTERNS[pattern];
    this.startTime = Date.now();
  }

  get totalDuration(): number {
    const d = this.durations;
    return d.inhale + d.hold1 + d.exhale + d.hold2;
  }

  setPattern(pattern: Pattern): void {
    this.pattern = pattern;
    this.durations = PATTERNS[pattern];
    this.startTime = Date.now(); // Reset cycle
  }

  /**
   * Returns current breathing amplitude [0..1] following raised-cosine curve
   * within inhale/exhale phases, flat during hold phases.
   */
  getAmplitude(): number {
    const elapsed = (Date.now() - this.startTime) % this.totalDuration;
    const { inhale, hold1, exhale, hold2 } = this.durations;

    if (elapsed < inhale) {
      // Inhale phase: ease-in from 0 to 1 using raised cosine
      const progress = elapsed / inhale;
      return (1 - Math.cos(Math.PI * progress)) / 2;
    }

    if (elapsed < inhale + hold1) {
      // Hold1 phase: stay at maximum
      return 1;
    }

    const exhaleStart = inhale + hold1;
    if (elapsed < exhaleStart + exhale) {
      // Exhale phase: ease-out from 1 to 0 using raised cosine
      const progress = (elapsed - exhaleStart) / exhale;
      return (1 + Math.cos(Math.PI * progress)) / 2;
    }

    // Hold2 phase: stay at minimum
    return 0;
  }

  /**
   * Returns the current breathing phase and remaining seconds
   */
  getCurrentPhase(): { phase: string; remainingSeconds: number } {
    const elapsed = (Date.now() - this.startTime) % this.totalDuration;
    const { inhale, hold1, exhale, hold2 } = this.durations;

    if (elapsed < inhale) {
      return {
        phase: "Inhale",
        remainingSeconds: Math.ceil((inhale - elapsed) / 1000)
      };
    }

    if (elapsed < inhale + hold1) {
      return {
        phase: "Hold",
        remainingSeconds: Math.ceil((inhale + hold1 - elapsed) / 1000)
      };
    }

    const exhaleStart = inhale + hold1;
    if (elapsed < exhaleStart + exhale) {
      return {
        phase: "Exhale",
        remainingSeconds: Math.ceil((exhaleStart + exhale - elapsed) / 1000)
      };
    }

    // Hold2 phase
    return {
      phase: "Hold",
      remainingSeconds: Math.ceil((this.totalDuration - elapsed) / 1000)
    };
  }
}
