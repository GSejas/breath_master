# BreatheGlow

A minimal breathing status-bar indicator for VS Code that "breathes" via icon animation to encourage mindful pacing.

## Features

- **Visual Breathing Cues**: Icons show breathing direction (↑ inhale, — hold, ↓ exhale)
- **Dual Status Items**: Left shows phase + countdown, right shows pattern name (clickable!)
- Pure TypeScript engine with inhale/hold1/exhale/hold2 phases and raised-cosine curve
- Configurable patterns, intensity, and tick interval
- Toggle on/off & cycle patterns via clicks or Command Palette
- Safe in Restricted Mode & Web Extension compatible
- No DOM access, theme-safe, minimal footprint

## Configuration

| Setting                    | Type    | Default | Description                                            |
|----------------------------|---------|---------|--------------------------------------------------------|
| `breatheGlow.enabled`      | boolean | `true`  | Enable or disable the breathing status item           |
| `breatheGlow.pattern`      | enum    | `"chill"` | Breathing pattern: `chill` / `medium` / `active` / `boxing` / `relaxing` |
| `breatheGlow.intensity`    | number  | `0.6`   | Visual intensity 0.0–1.0 (perceptually mapped ≤0.49) |
| `breatheGlow.tickMs`       | number  | `100`   | Animation tick interval in milliseconds (16-1000)     |
| `breatheGlow.showBoth`     | boolean | `true`  | Show indicators on both left and right sides          |
| `breatheGlow.showNotifications` | boolean | `false` | Show phase change notifications                    |

### Breathing Patterns

- **chill**: 6s inhale → 8s exhale (slow and easy)
- **medium**: 5s inhale → 5s exhale (coherence breathing)  
- **active**: 4s inhale → 2s hold → 4s exhale → 1s hold (energizing)
- **boxing**: 4s inhale → 4s hold → 4s exhale → 4s hold (tactical breathing)
- **relaxing**: 4s inhale → 7s hold → 8s exhale (4-7-8 technique)

## Commands

- **BreatheGlow: Toggle** (`breatheGlow.toggle`) - Enable/disable breathing animation
- **BreatheGlow: Cycle Pattern** (`breatheGlow.cyclePattern`) - Cycle through: Chill → Medium → Active → Boxing → Relaxing

## Usage Tips

- **Visual Breathing Guide**: Watch the icons change direction with your breath
  - `○↑` = Inhale (growing circle + up arrow)
  - `●—` = Hold (full circle + flat line)  
  - `○↓` = Exhale (shrinking circle + down arrow)
- **Click the left status item** to toggle breathing on/off
- **Click the right status item** to cycle through the 5 fun breathing patterns
- **Right status item** shows current pattern name and breathes with you!

## Development

```bash
pnpm install
pnpm run compile
# Press F5 in VS Code to launch Extension Development Host
```

## Architecture

- `src/engine/breathe-engine.ts` - Framework-agnostic breathing logic with raised-cosine curves
- `src/vscode/extension.ts` - VS Code status bar adapter that subscribes to engine updates

Total: ~120 lines of code