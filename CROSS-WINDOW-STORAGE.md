# Cross-Window Storage Sync Implementation

## Overview
Implemented a versioned storage wrapper with cross-window synchronization for VS Code extension game data, replacing direct `globalState` usage to prevent lost updates and ensure consistent data across multiple VS Code windows.

## Problem Solved
- **Multiple windows = multiple extension hosts** with separate in-memory copies of globalState
- **Lost updates** when multiple windows modify game data concurrently  
- **Stale UI** in other windows after changes made elsewhere
- **No automatic notification** when other windows update storage

## Solution Architecture

### 1. StorageWrapper (`src/vscode/storage-wrapper.ts`)
- **Versioned data structure**: `{version, lastModified, clientId, payload}`
- **Optimistic concurrency control**: Read-modify-write with retry on conflicts
- **Touch file notifications**: Atomic writes to `globalStoragePath/state-change.touch`
- **FileSystemWatcher integration**: Cross-window change detection

### 2. Updated Components
- **MeditationTracker** (`src/engine/gamification.ts`): Now supports both legacy and versioned storage
- **OnboardingManager** (`src/engine/onboarding.ts`): Same dual-mode support
- **Extension activation** (`src/vscode/extension.ts`): Uses StorageWrapper, sets up cross-window watcher

### 3. Key Features

#### Versioned Updates
```typescript
// Old way (race conditions)
const current = storage.get('key');
const updated = modify(current);
storage.update('key', updated); // May overwrite concurrent changes

// New way (optimistic concurrency)
await storageWrapper.update('key', (current) => modify(current));
// Automatically retries on version conflicts
```

#### Cross-Window Sync
```typescript
// Writer: After updating globalState, write atomic touch file
await fs.promises.writeFile(tempFile, JSON.stringify(notification));
await fs.promises.rename(tempFile, touchFile); // Atomic

// Other windows: Watch touch file, reload data on change
watcher.onDidChange(() => {
  meditationTracker.reloadFromStorage();
  updateGamificationDisplay(); // Refresh UI
});
```

#### Backward Compatibility  
- Detects storage type via constructor name: `storage.constructor.name === 'StorageWrapper'`
- Falls back to legacy behavior for existing storage APIs
- All existing tests continue to pass

## Implementation Benefits

### Consistency Model
- **Before**: Eventual consistency with potential lost updates
- **After**: Strong eventual consistency with conflict resolution

### Concurrency Safety
- **Before**: Last-write-wins, silent data loss
- **After**: Optimistic updates with automatic retry on conflicts

### Cross-Window UX
- **Before**: Changes invisible until restart/reload
- **After**: Near real-time sync (typically <1 second)

### Error Handling
- Touch file failures are non-critical (won't break main operations)
- Storage conflicts retry up to 3 times with exponential backoff
- Graceful fallback to legacy behavior if needed

## Usage Examples

### Creating Storage Wrapper
```typescript
const storageWrapper = new StorageWrapper(context, { 
  touchFileName: 'breath-master-state.touch' 
});
```

### Setting Up Cross-Window Sync
```typescript
const watcher = storageWrapper.createTouchWatcher((key, version) => {
  if (key === 'breathMaster.meditationStats') {
    meditationTracker.reloadFromStorage();
    updateGamificationDisplay();
  }
});
context.subscriptions.push(watcher);
```

### Data Updates
```typescript
// Simple set
await storageWrapper.set('key', newValue);

// Updater function (recommended for complex changes)
await storageWrapper.update('stats', (current) => ({
  ...current,
  totalXP: current.totalXP + 10,
  lastModified: Date.now()
}));
```

## Testing & Validation
- ✅ All 76 existing unit tests pass
- ✅ TypeScript compilation successful  
- ✅ Backward compatibility maintained
- ✅ No breaking changes to existing APIs

## Files Modified
1. `src/vscode/storage-wrapper.ts` - New versioned storage implementation
2. `src/engine/gamification.ts` - Updated to support dual storage modes
3. `src/engine/onboarding.ts` - Updated to support dual storage modes  
4. `src/vscode/extension.ts` - Integrated storage wrapper and cross-window watcher

## Next Steps (Optional Enhancements)
1. **Add conflict resolution strategies** for complex merge scenarios
2. **Implement event log pattern** for high-conflict data (append-only events)
3. **Add storage metrics** (conflict rate, sync latency)
4. **Support remote/WSL environments** with shared storage paths
5. **Add compression** for large data objects

## Trade-offs Considered
- **Touch file approach** vs **SQLite**: Touch file is simpler, no native dependencies
- **Optimistic updates** vs **Pessimistic locking**: Optimistic chosen for better UX
- **File watching** vs **Polling**: File watching is more efficient, responsive  
- **Versioning** vs **Timestamps**: Version numbers are more reliable than clock-based solutions
