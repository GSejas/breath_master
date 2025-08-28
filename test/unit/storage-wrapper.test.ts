/**
 * storage-wrapper.test.ts
 * Unit tests for the versioned storage wrapper
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { StorageWrapper, VersionedData } from '../../src/vscode/storage-wrapper';
import * as fs from 'fs';
import * as path from 'path';

// Mock VS Code extension context
const mockContext = {
  globalState: {
    data: new Map(),
    get<T>(key: string, defaultValue?: T): T {
      return this.data.get(key) ?? defaultValue;
    },
    update(key: string, value: any): Promise<void> {
      this.data.set(key, value);
      return Promise.resolve();
    }
  },
  globalStoragePath: '/tmp/test-storage',
  extensionPath: '/tmp/test-extension'
};

// Mock fs operations
vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  promises: {
    writeFile: vi.fn(() => Promise.resolve()),
    rename: vi.fn(() => Promise.resolve()),
    readFile: vi.fn(() => Promise.resolve('{"key":"test","version":1,"timestamp":1234567890}')),
  }
}));

describe('StorageWrapper', () => {
  let storage: StorageWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.globalState.data.clear();
    storage = new StorageWrapper(mockContext as any, { touchFileName: 'test.touch' });
  });

  describe('Basic Operations', () => {
    test('should get default value when key does not exist', () => {
      const result = storage.get('nonexistent', { defaultValue: 'test' });
      
      expect(result.version).toBe(0);
      expect(result.payload).toEqual({ defaultValue: 'test' });
      expect(result.clientId).toBeTruthy();
      expect(result.lastModified).toBeTruthy();
    });

    test('should get stored versioned data', () => {
      const testData: VersionedData<string> = {
        version: 5,
        lastModified: '2023-01-01T00:00:00.000Z',
        clientId: 'test-client',
        payload: 'test-payload'
      };
      
      mockContext.globalState.data.set('test-key', testData);
      const result = storage.get('test-key');
      
      expect(result).toEqual(testData);
    });

    test('should update data with version increment', async () => {
      // Set initial data
      const initialData: VersionedData<number> = {
        version: 1,
        lastModified: '2023-01-01T00:00:00.000Z',
        clientId: 'test-client',
        payload: 10
      };
      mockContext.globalState.data.set('counter', initialData);

      // Update data
      const result = await storage.update('counter', (current: number) => current + 5, 0);

      expect(result.version).toBe(2);
      expect(result.payload).toBe(15);
      expect(mockContext.globalState.data.get('counter')).toEqual(result);
    });

    test('should set data directly', async () => {
      const result = await storage.set('direct-key', { value: 'direct' });

      expect(result.version).toBe(1);
      expect(result.payload).toEqual({ value: 'direct' });
      expect(mockContext.globalState.data.get('direct-key')).toEqual(result);
    });
  });

  describe('Touch File Notifications', () => {
    test('should create touch watcher', () => {
      const mockOnReload = vi.fn();
      const watcher = storage.createTouchWatcher(mockOnReload);

      expect(watcher).toBeDefined();
      expect(typeof watcher.onDidChange).toBe('function');
      expect(typeof watcher.onDidCreate).toBe('function');
    });

    test('should write touch file on update', async () => {
      await storage.set('test-key', 'test-value');

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.tmp'),
        expect.stringContaining('"key":"test-key"'),
        'utf8'
      );
      expect(fs.promises.rename).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle update failures gracefully', async () => {
      const mockError = new Error('Storage failed');
      vi.spyOn(mockContext.globalState, 'update').mockRejectedValue(mockError);

      await expect(storage.update('fail-key', (x) => x + 1, 0)).rejects.toThrow('Storage failed');
    });

    test('should handle touch file write failures gracefully', async () => {
      vi.spyOn(fs.promises, 'writeFile').mockRejectedValue(new Error('File write failed'));

      // Should not throw - touch file failure is non-critical
      await expect(storage.set('test-key', 'test-value')).resolves.toBeDefined();
    });
  });

  describe('Compatibility', () => {
    test('should provide raw globalState access', () => {
      const rawGlobalState = storage.getRawGlobalState();
      expect(rawGlobalState).toBe(mockContext.globalState);
    });
  });
});
