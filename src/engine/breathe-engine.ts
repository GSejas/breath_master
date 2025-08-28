/**
 * breathe-engine.ts
 * Pure TypeScript breathing engine with inhale/hold1/exhale/hold2 phases
 * and smooth raised-cosine curve transitions.
 */

export type Pattern = "chill" | "medium" | "active" | "boxing" | "relaxing" | "custom";
export type AnimationPreset = "default" | "minimal" | "nature" | "custom";
export type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";

interface PhaseDurations {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

interface AnimationFigures {
  inhale: string[];
  hold1: string[];
  exhale: string[];
  hold2: string[];
}

const PATTERNS: Record<Exclude<Pattern, "custom">, PhaseDurations> = {
  chill:      { inhale: 6000, hold1: 0,    exhale: 8000, hold2: 0    }, // Slow and easy
  medium:     { inhale: 5000, hold1: 0,    exhale: 5000, hold2: 0    }, // Coherence breathing
  active:     { inhale: 4000, hold1: 2000, exhale: 4000, hold2: 1000 }, // Energizing
  boxing:     { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 }, // Box breathing (tactical)
  relaxing:   { inhale: 4000, hold1: 7000, exhale: 8000, hold2: 0    }  // 4-7-8 technique
};

const DEFAULT_FIGURES: AnimationFigures = {
  inhale: ["$(circle-small-filled)", "$(circle-filled)", "$(record)"],
  hold1: ["$(record)", "$(record)", "$(record)"],
  // Keep figures ordered small->large so amplitude mapping (0..1 -> index)
  // is monotonic for both inhale and exhale phases.
  exhale: ["$(circle-small-filled)", "$(circle-filled)", "$(record)"],
  hold2: ["$(circle-small-filled)", "$(circle-small-filled)", "$(circle-small-filled)"]
};

const MINIMAL_FIGURES: AnimationFigures = {
  // Use existing codicon names (small -> large) for minimal preset
  inhale: ["$(circle-small-filled)", "$(circle)", "$(circle-filled)"],
  hold1: ["$(circle-filled)", "$(circle-filled)", "$(circle-filled)"],
  // Mirror inhale ordering (small->large) for consistent mapping.
  exhale: ["$(circle-small-filled)", "$(circle)", "$(circle-filled)"],
  hold2: ["$(circle-small-filled)", "$(circle-small-filled)", "$(circle-small-filled)"]
};

const NATURE_FIGURES: AnimationFigures = {
  // Use emoji glyphs for organic preset (single code point each)
  inhale: ["🌱", "🌿", "🌳"],
  hold1: ["🌳", "🌳", "🌳"],
  exhale: ["🌳", "🌿", "🌱"],
  hold2: ["🌱", "🌱", "🌱"]
};

const PRESET_FIGURES: Record<Exclude<AnimationPreset, "custom">, AnimationFigures> = {
  default: DEFAULT_FIGURES,
  minimal: MINIMAL_FIGURES,
  nature: NATURE_FIGURES
};

/**
 * Framework-agnostic breathing engine that generates normalized amplitude [0..1]
 * using raised-cosine easing for smooth inhale/exhale transitions.
 */
export class BreatheEngine {
  private durations: PhaseDurations;
  private startTime: number;
  private customPattern?: PhaseDurations;

  constructor(public pattern: Pattern = "chill", customPattern?: string) {
    this.durations = this.getPatternDurations(pattern, customPattern);
    this.startTime = Date.now();
  }

  private getPatternDurations(pattern: Pattern, customPattern?: string): PhaseDurations {
    if (pattern === "custom") {
      if (customPattern) {
        return this.parseCustomPattern(customPattern);
      } else {
        // Fallback to chill if custom pattern is invalid
        return PATTERNS.chill;
      }
    }
    return PATTERNS[pattern as Exclude<Pattern, "custom">];
  }

  private parseCustomPattern(customPattern: string): PhaseDurations {
    try {
      const parts = customPattern.split('-').map(p => parseInt(p.trim()));
      if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0)) {
        return {
          inhale: parts[0] * 1000,
          hold1: parts[1] * 1000,
          exhale: parts[2] * 1000,
          hold2: parts[3] * 1000
        };
      }
    } catch (error) {
      console.warn('Invalid custom pattern:', customPattern);
    }
    // Return default if parsing fails
    return PATTERNS.chill;
  }

  get totalDuration(): number {
    const d = this.durations;
    return d.inhale + d.hold1 + d.exhale + d.hold2;
  }

  setPattern(pattern: Pattern, customPattern?: string): void {
    this.pattern = pattern;
    this.durations = this.getPatternDurations(pattern, customPattern);
    this.startTime = Date.now(); // Reset cycle
  }

  /**
   * Returns current breathing amplitude [0..1] following raised-cosine curve
   * within inhale/exhale phases, flat during hold phases.
   */
  getAmplitude(): number {
    // Protect against degenerate zero-duration patterns
    const total = this.totalDuration;
    if (total === 0) return 0;

    const elapsed = (Date.now() - this.startTime) % total;
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
    const total = this.totalDuration;
    if (total === 0) {
      return { phase: "Hold", remainingSeconds: 0 };
    }

    const elapsed = (Date.now() - this.startTime) % total;
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

  /**
   * Returns the detailed current breathing phase for animation purposes
   */
  getDetailedPhase(): { phase: BreathingPhase; remainingSeconds: number } {
    const total = this.totalDuration;
    if (total === 0) {
      return { phase: "hold2", remainingSeconds: 0 };
    }

    const elapsed = (Date.now() - this.startTime) % total;
    const { inhale, hold1, exhale, hold2 } = this.durations;

    if (elapsed < inhale) {
      return {
        phase: "inhale",
        remainingSeconds: Math.ceil((inhale - elapsed) / 1000)
      };
    }

    if (elapsed < inhale + hold1) {
      return {
        phase: "hold1",
        remainingSeconds: Math.ceil((inhale + hold1 - elapsed) / 1000)
      };
    }

    const exhaleStart = inhale + hold1;
    if (elapsed < exhaleStart + exhale) {
      return {
        phase: "exhale",
        remainingSeconds: Math.ceil((exhaleStart + exhale - elapsed) / 1000)
      };
    }

    // Hold2 phase
    return {
      phase: "hold2",
      remainingSeconds: Math.ceil((this.totalDuration - elapsed) / 1000)
    };
  }

  /**
   * Deterministic sampler: compute amplitude for a given elapsed ms since phase start.
   * Helpful for debugging / offline analysis where we don't rely on Date.now().
   */
  getAmplitudeAt(elapsedMs: number): number {
    const total = this.totalDuration;
    if (total === 0) return 0;

    const elapsed = elapsedMs % total;
    const { inhale, hold1, exhale, hold2 } = this.durations;

    if (elapsed < inhale) {
      const progress = elapsed / inhale;
      return (1 - Math.cos(Math.PI * progress)) / 2;
    }

    if (elapsed < inhale + hold1) {
      return 1;
    }

    const exhaleStart = inhale + hold1;
    if (elapsed < exhaleStart + exhale) {
      const progress = (elapsed - exhaleStart) / exhale;
      return (1 + Math.cos(Math.PI * progress)) / 2;
    }

    return 0;
  }

  /**
   * Deterministic phase inspector for a supplied elapsed ms (useful for reporting).
   */
  getDetailedPhaseAt(elapsedMs: number): { phase: BreathingPhase; remainingSeconds: number } {
    const total = this.totalDuration;
    if (total === 0) return { phase: 'hold2', remainingSeconds: 0 };

    const elapsed = elapsedMs % total;
    const { inhale, hold1, exhale, hold2 } = this.durations;

    if (elapsed < inhale) {
      return { phase: 'inhale', remainingSeconds: Math.ceil((inhale - elapsed) / 1000) };
    }

    if (elapsed < inhale + hold1) {
      return { phase: 'hold1', remainingSeconds: Math.ceil((inhale + hold1 - elapsed) / 1000) };
    }

    const exhaleStart = inhale + hold1;
    if (elapsed < exhaleStart + exhale) {
      return { phase: 'exhale', remainingSeconds: Math.ceil((exhaleStart + exhale - elapsed) / 1000) };
    }

    return { phase: 'hold2', remainingSeconds: Math.ceil((this.totalDuration - elapsed) / 1000) };
  }

  /**
   * Get animation figure for current phase and amplitude
   */
  static getAnimationFigure(
    phase: BreathingPhase, 
    amplitude: number, 
    preset: AnimationPreset = "default",
    customFigures?: AnimationFigures
  ): string {
    let figures: AnimationFigures;
    
    if (preset === "custom" && customFigures) {
      figures = customFigures;
    } else if (preset !== "custom") {
      figures = PRESET_FIGURES[preset];
    } else {
      figures = DEFAULT_FIGURES; // fallback
    }

    const phaseFigures = figures[phase];
    if (!phaseFigures || phaseFigures.length === 0) {
      return "$(pulse)"; // fallback icon
    }

    // Map amplitude to figure index
    const index = Math.floor(amplitude * phaseFigures.length);
    const clampedIndex = Math.min(index, phaseFigures.length - 1);
    
    return phaseFigures[clampedIndex];
  }
}

export { PRESET_FIGURES, DEFAULT_FIGURES, MINIMAL_FIGURES, NATURE_FIGURES };
