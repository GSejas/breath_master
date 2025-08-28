import { describe, it, expect } from 'vitest';
import { BreatheEngine, PRESET_FIGURES, DEFAULT_FIGURES, MINIMAL_FIGURES, NATURE_FIGURES } from '../../src/engine/breathe-engine';
import CODICON_NAMES from '../../src/engine/settings/codicon-names';

const CODICON_SET = new Set<string>(CODICON_NAMES as readonly string[]);

function isCodiconWrapped(s: string): boolean {
  const m = /^\$\(([^)]+)\)$/.exec(s);
  if (!m) return false;
  return CODICON_SET.has(m[1]);
}

function isSingleEmoji(s: string): boolean {
  // Count code points
  const cp = Array.from(s);
  if (cp.length !== 1) return false;
  // Rough emoji test using Unicode Emoji property
  try {
    return /\p{Emoji}/u.test(s);
  } catch (e) {
    // If the runtime doesn't support Unicode property escapes, fall back to length-based check
    return true;
  }
}

function assertValidFigure(s: string) {
  const ok = isCodiconWrapped(s) || isSingleEmoji(s);
  expect(ok, `Invalid figure: ${s}`).toBe(true);
}

describe('Animation figure validation (static presets)', () => {
  const presets = { DEFAULT_FIGURES, MINIMAL_FIGURES, NATURE_FIGURES, ...PRESET_FIGURES } as Record<string, any>;
  Object.entries(presets).forEach(([name, figures]) => {
    it(`preset ${name} should contain only valid figures`, () => {
      ['inhale', 'hold1', 'exhale', 'hold2'].forEach((phase: string) => {
        const arr: string[] = figures[phase];
        expect(Array.isArray(arr)).toBe(true);
        arr.forEach(f => assertValidFigure(f));
      });
    });
  });
});

describe('Animation figure validation (dynamic getAnimationFigure)', () => {
  const presets = ['default', 'minimal', 'nature'] as const;
  const phases = ['inhale', 'hold1', 'exhale', 'hold2'] as const;

  presets.forEach(preset => {
    it(`getAnimationFigure returns valid figures for preset=${preset}`, () => {
      phases.forEach(phase => {
        // sample a few amplitudes across 0..1
        [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].forEach(a => {
          const figure = BreatheEngine.getAnimationFigure(phase as any, a, preset as any);
          assertValidFigure(figure);
        });
      });
    });
  });

  it('custom figures object should be validated when used', () => {
    const custom = {
      inhale: ['🌱', '$(circle-filled)'],
      hold1: ['$(record)'],
      exhale: ['$(circle-small-filled)', '🌿'],
      hold2: ['🌱']
    } as any;

    phases.forEach(phase => {
      [0, 0.5, 1].forEach(a => {
        const figure = BreatheEngine.getAnimationFigure(phase as any, a, 'custom', custom);
        assertValidFigure(figure);
      });
    });
  });
});
