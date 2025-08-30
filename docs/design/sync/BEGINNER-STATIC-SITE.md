![Beginner Implementation Banner](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjgiIGhlaWdodD0iMjQiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB3aWR0aD0iMjgiIGhlaWdodD0iMjQiIGZpbGw9IiMwNjVmNDYiLz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIxNCwyIDI0LDggMjQsMTYgMTQsMjIgNCwxNiA0LDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM0ZDM5OSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2siIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CZWdpbm5lciBJbXBsZW1lbnRhdGlvbjwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNGQzOTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlN0YXRpYyBTaXRlIEltcGxlbWVudGF0aW9uPC90ZXh0PgogIDx0ZXh0IHg9IjQwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjcpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+X77iPIFNpbXBsZSBXZWIgSW50ZXJmYWNlPC90ZXh0Pgo8L3N2Zz4=)

# 🌱 Beginner: Static Site Implementation

**Difficulty:** ⭐☆☆☆☆ (Beginner)  
**Time Estimate:** 4-6 hours  
**Tech Stack:** HTML + CSS + Vanilla JS  

## One-Shot Prompt

```
Create a minimal breath master sync portal using only HTML, CSS, and vanilla JavaScript. 
The site should allow users to enter a sync code and display their breathing progress.

REQUIREMENTS:
- Single page application (no routing)
- Responsive design (mobile-first)
- Input field for sync codes (format: BM-abc123-def456)
- Mock data for demonstration
- Clean, mindful UI with breathing room
- Progress visualization with XP bars
- No external dependencies except fonts/icons

FEATURES TO INCLUDE:
1. Sync code input with validation
2. User progress display (level, XP, streak)
3. Global ranking simulation
4. Recent activity list
5. Basic animations for breathing elements

MOCK DATA STRUCTURE:
{
  "syncCode": "BM-abc123-def456",
  "user": {
    "level": 6,
    "title": "Forest Guide", 
    "currentXP": 1847,
    "nextLevelXP": 3000,
    "currentStreak": 8,
    "todayMinutes": 12,
    "totalSessions": 89,
    "globalRank": 247,
    "totalUsers": 12458
  },
  "recentActivity": [
    {"time": "2 hours ago", "action": "Completed Chill session", "xp": 24},
    {"time": "Yesterday", "action": "Maintained 7-day streak", "xp": 50}
  ]
}

DESIGN GUIDELINES:
- Use calm, nature-inspired colors (greens, soft blues)
- Typography: System fonts for performance
- Icons: Use Unicode/emoji or simple SVG
- Layout: Card-based with generous white space
- Animations: Subtle CSS transitions only

DELIVERABLES:
- index.html (complete single page)
- styles.css (responsive styles)
- script.js (sync code validation & UI updates)
- README.md with setup instructions
```

## Expected Architecture

```ascii
┌─────────────────────────────────┐
│         STATIC WEBSITE          │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐ │
│  │        index.html           │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │     Sync Code Input     │ │ │
│  │  └─────────────────────────┘ │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │   Progress Display      │ │ │
│  │  └─────────────────────────┘ │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │   Activity Feed         │ │ │
│  │  └─────────────────────────┘ │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │       styles.css            │ │
│  │  • Mobile-first responsive  │ │
│  │  • CSS Grid/Flexbox        │ │
│  │  • Smooth transitions      │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │       script.js             │ │
│  │  • Sync code validation     │ │
│  │  • Mock data handling       │ │
│  │  • DOM manipulation        │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## User Journey

```ascii
USER JOURNEY: Static Site Discovery
═══════════════════════════════════

1. DISCOVERY
   User gets sync code from VS Code extension
   ┌─────────┐    ┌─────────────┐
   │ VS Code │───▶│ Copy Code   │
   │Extension│    │BM-abc123... │
   └─────────┘    └─────────────┘

2. NAVIGATION  
   ┌─────────────────┐
   │ User types URL: │
   │breathmaster.app │
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │  Landing Page   │
   │  Loads Instantly│
   └─────────────────┘

3. INPUT
   ┌─────────────────────────────┐
   │ Enter sync code:            │
   │ ┌─────────────────────────┐ │
   │ │ BM-abc123-def456        │ │
   │ └─────────────────────────┘ │
   │        [Validate]           │
   └─────────────────────────────┘

4. REVEAL
   ┌─────────────────────────────┐
   │ ✨ Progress Appears         │
   │                             │
   │ 🌳 Forest Guide - Level 6   │
   │ ▰▰▰▰▰▰▱▱▱▱ 1,847 XP        │
   │ 🔥 8 day streak             │
   │ 🏆 Rank #247 of 12,458      │
   └─────────────────────────────┘

5. ENGAGEMENT
   ┌─────────────────────────────┐
   │ Recent Activity:            │
   │ • Session completed +24 XP  │
   │ • Streak maintained +50 XP  │
   │ • Achievement unlocked      │
   └─────────────────────────────┘

EMOTIONAL JOURNEY:
Curiosity → Anticipation → Satisfaction → Motivation
```

## Wireframe

```ascii
┌─────────────────────────────────────────────────────────────┐
│  🌱 Breath Master Portal                      [Mobile View] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Enter your sync code from VS Code:                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BM-abc123-def456                           [Paste] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                YOUR PROGRESS                        │   │
│  │                                                     │   │
│  │         🌳 Forest Guide                             │   │
│  │            Level 6                                  │   │
│  │                                                     │   │
│  │    ▰▰▰▰▰▰▱▱▱▱ 1,847 / 3,000 XP                    │   │
│  │                                                     │   │
│  │    Current Streak: 🔥 8 days                        │   │
│  │    Today: 12 minutes                                │   │
│  │    Total Sessions: 89                               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🏆 Global Rank: #247 of 12,458 (Top 2%)                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              RECENT ACTIVITY                        │   │
│  │                                                     │   │
│  │  • 2 hours ago: Chill session completed → +24 XP   │   │
│  │  • Yesterday: 7-day streak maintained → +50 XP     │   │
│  │  • 2 days ago: "Steady Breather" unlocked → +100   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Last sync: 5 minutes ago                                  │
│                                                             │
│  ┌─────────────────────┐ ┌─────────────────────────────┐   │
│  │   Share Progress    │ │     Back to VS Code         │   │
│  └─────────────────────┘ └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Success Criteria

- ✅ Page loads in <2 seconds
- ✅ Works offline after first load
- ✅ Mobile responsive (320px+)
- ✅ Sync code validation works
- ✅ Smooth CSS animations
- ✅ No JavaScript errors
- ✅ Accessible (WCAG AA)
- ✅ Clean, mindful aesthetic