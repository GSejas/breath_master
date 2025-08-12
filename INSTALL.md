# BreatheGlow Extension - Installation & Usage Guide

## ✅ Extension Successfully Enhanced & Installed! (v0.0.3)

The **BreatheGlow** extension now features **visual breathing icons with 5 fun patterns**.

### What's New in v0.0.3:
- **Visual Breathing Cues**: ↑ Inhale | — Hold | ↓ Exhale
- **5 Preset Patterns**: Chill, Medium, Active, Boxing, Relaxing
- **Dual Status Items**: Left (detailed) + Right (pattern cycle button)
- **Enhanced Tooltips**: Visual guide and pattern cycling info

### Files Created:
- `breathe-glow-0.0.3.vsix` (8.46 KB) - The enhanced extension package
- **Total Implementation**: 253 lines (96 engine + 157 extension)

### How to Use:

#### 1. **Visual Breathing Experience**
- **Left Status Bar**: `○↑ Inhale 4s` (size + direction + phase + countdown)
- **Right Status Bar**: `●↑ Chill` (clickable pattern button)
- Watch the icons guide your breathing naturally!

#### 2. **5 Fun Breathing Patterns** (Click right button to cycle!)
- **🌊 Chill**: 6s inhale → 8s exhale (slow and easy)
- **⚖️ Medium**: 5s inhale → 5s exhale (coherence breathing)
- **⚡ Active**: 4s inhale → 2s hold → 4s exhale → 1s hold (energizing)
- **🥊 Boxing**: 4s inhale → 4s hold → 4s exhale → 4s hold (tactical)
- **😌 Relaxing**: 4s inhale → 7s hold → 8s exhale (4-7-8 technique)

#### 3. **Interactive Controls**
- **Left click**: Toggle breathing on/off
- **Right click**: Cycle through patterns sequentially
- **Command Palette**: "BreatheGlow: Toggle" / "BreatheGlow: Cycle Pattern"

#### 4. **Enhanced Settings**
```json
{
  "breatheGlow.enabled": true,
  "breatheGlow.pattern": "chill",        // chill|medium|active|boxing|relaxing
  "breatheGlow.intensity": 0.6,          // 0.0-1.0 visual intensity
  "breatheGlow.tickMs": 100,             // animation speed
  "breatheGlow.showBoth": true,          // dual status items
  "breatheGlow.showNotifications": false // phase change popups
}
```

### Development:
```bash
npm run compile    # Build
npm run watch      # Build + watch (currently running)
vsce package       # Create .vsix package
F5                 # Launch Extension Development Host
```

**Perfect for mindful coding sessions!** 🧘‍♀️💻✨

#### 2. **Commands Available**
Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for:
- **"BreatheGlow: Toggle"** - Turn breathing on/off
- **"BreatheGlow: Cycle Pattern"** - Switch between box/four_7_8/coherence patterns

#### 3. **Settings**
Add to your VS Code `settings.json`:
```json
{
  "breatheGlow.enabled": true,
  "breatheGlow.pattern": "box",         // "box" | "four_7_8" | "coherence"
  "breatheGlow.intensity": 0.6,         // 0.0 to 1.0 (lower = more subtle)
  "breatheGlow.tickMs": 100             // animation speed in milliseconds
}
```

#### 4. **Breathing Patterns**
- **box**: 4s inhale → 4s hold → 4s exhale → 4s hold
- **four_7_8**: 4s inhale → 7s hold → 8s exhale → immediate repeat
- **coherence**: 5s inhale → 5s exhale (no holds)

### Development Commands:
```bash
npm run compile    # Build once
npm run watch      # Build and watch for changes (currently running)
vsce package       # Create .vsix package
code --install-extension breathe-glow-0.0.1.vsix  # Install
```

### Press F5 in VS Code to launch Extension Development Host for testing!

**Total Implementation**: 169 lines of TypeScript, fully Web Extension compatible, Restricted Mode safe.
