# Breath Master Backend - One-Shot Implementation Prompt

## Overview
Create a minimal backend service for the Breath Master VS Code extension that enables cross-device sync and anonymous leaderboards while maintaining privacy-first design principles.

## Requirements

### Core Features (MVP)
1. **User Progress Sync** - Anonymous cross-device synchronization
2. **Anonymous Leaderboards** - Opt-in competitive rankings
3. **Challenge Distribution** - Daily breathing challenges

### Technical Stack
- **Backend**: Node.js + Express or Python + FastAPI
- **Database**: PostgreSQL or MongoDB  
- **Auth**: Simple anonymous UUID-based (no personal data)
- **Deployment**: Docker-ready for cloud deployment

## API Endpoints

### 1. Progress Sync
```
POST /api/v1/sync
- Body: { userId: "uuid", data: { totalXP, currentStreak, todaySessionTime, ... } }
- Returns: { synced: true, serverData: {...} }
```

### 2. Anonymous Leaderboards  
```
GET /api/v1/leaderboard?period=daily|weekly|monthly
- Returns: { rankings: [{ rank, xp, anonymousId }] }
```

### 3. Challenge Distribution
```
GET /api/v1/challenges/daily
- Returns: { challenges: [{ id, title, description, rewardXP, eonMessage }] }
```

## Data Model

### User Progress (matches extension export format)
```json
{
  "userId": "anonymous-uuid",
  "lastSync": "2025-01-15T...",
  "data": {
    "meditation": {
      "totalXP": 150,
      "currentStreak": 5,
      "todaySessionTime": 600000
    },
    "onboarding": {
      "hasSeenTour": true,
      "gamificationOptIn": true
    }
  }
}
```

### Leaderboard Entry
```json
{
  "anonymousId": "uuid-prefix", 
  "xp": 1250,
  "period": "daily",
  "timestamp": "2025-01-15T..."
}
```

## Privacy Requirements
- **No personal data** - only anonymous UUIDs
- **Opt-in only** - users must explicitly enable sync
- **Local-first** - backend is supplementary, not required
- **Data retention** - clear policies for anonymous data

## Security
- Rate limiting on all endpoints
- Input validation and sanitization  
- CORS properly configured for VS Code extension
- Optional API key for challenge distribution

## Development Priorities
1. **Phase 1**: Progress sync endpoint
2. **Phase 2**: Anonymous leaderboards
3. **Phase 3**: Challenge distribution system

## Integration with Extension
- Extend existing `VSCodeSettingsAdapter` with sync options
- Add sync toggle to gamification settings
- Modify `MeditationTracker.getStats()` to include sync capability
- Respect existing privacy settings (`local-only` vs `export-allowed`)

## Success Criteria
- Seamless cross-device XP/streak sync
- Sub-100ms leaderboard response times
- Zero personal data collection
- Easy deployment and maintenance

---

**Implementation Note**: Focus on MVP functionality first. The extension already has rich local functionality - the backend should enhance, not replace existing features.