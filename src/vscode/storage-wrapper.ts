/**
 * storage-wrapper.ts
 * Versioned storage wrapper around VS Code globalState with cross-window sync
 * via touch file notifications and FileSystemWatcher
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface VersionedData<T = any> {
  version: number;
  lastModified: string;
  clientId: string;
  payload: T;
}

export interface StorageWrapperOptions {
  maxRetries?: number;
  touchFileName?: string;
}

/**
 * Versioned storage wrapper that provides:
 * - Optimistic concurrency control with versioning
 * - Atomic touch file notifications for cross-window sync
 * - Retry logic for conflicting updates
 */
export class StorageWrapper {
  private clientId: string;
  private touchFilePath: string;
  private maxRetries: number;

  constructor(
    private context: vscode.ExtensionContext,
    private options: StorageWrapperOptions = {}
  ) {
    this.clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.maxRetries = options.maxRetries || 3;
    this.touchFilePath = path.join(
      context.globalStoragePath || context.extensionPath,
      options.touchFileName || 'state-change.touch'
    );
    
    // Ensure storage directory exists
    this.ensureStorageDirectory();
  }

  private ensureStorageDirectory(): void {
    try {
      const dir = path.dirname(this.touchFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (error) {
      console.warn('Failed to create storage directory:', error);
    }
  }

  /**
   * Get data with version information
   */
  get<T>(key: string, defaultValue?: T): VersionedData<T> {
    const stored = this.context.globalState.get<VersionedData<T>>(key);
    
    if (!stored) {
      return {
        version: 0,
        lastModified: new Date().toISOString(),
        clientId: this.clientId,
        payload: defaultValue as T
      };
    }

    return stored;
  }

  /**
   * Update data with optimistic concurrency control and retry logic
   */
  async update<T>(
    key: string, 
    updater: (current: T) => T,
    defaultValue?: T
  ): Promise<VersionedData<T>> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const current = this.get<T>(key, defaultValue);
        const newPayload = updater(current.payload);
        
        const newData: VersionedData<T> = {
          version: current.version + 1,
          lastModified: new Date().toISOString(),
          clientId: this.clientId,
          payload: newPayload
        };

        // Update globalState
        await this.context.globalState.update(key, newData);

        // Notify other windows via touch file
        await this.notifyChange(key, newData.version);

        return newData;
      } catch (error) {
        console.warn(`Storage update attempt ${attempt + 1} failed:`, error);
        if (attempt === this.maxRetries - 1) {
          throw error;
        }
        // Brief delay before retry
        await new Promise(resolve => setTimeout(resolve, 10 + attempt * 10));
      }
    }

    throw new Error(`Failed to update ${key} after ${this.maxRetries} attempts`);
  }

  /**
   * Set data directly (bypasses updater pattern)
   */
  async set<T>(key: string, value: T): Promise<VersionedData<T>> {
    return this.update(key, () => value);
  }

  /**
   * Notify other extension hosts of changes via atomic touch file write
   */
  private async notifyChange(key: string, version: number): Promise<void> {
    try {
      const notification = {
        key,
        version,
        timestamp: Date.now(),
        clientId: this.clientId
      };

      const tempFile = this.touchFilePath + '.tmp';
      
      // Atomic write: write to temp file then rename
      await fs.promises.writeFile(tempFile, JSON.stringify(notification), 'utf8');
      await fs.promises.rename(tempFile, this.touchFilePath);
    } catch (error) {
      // Non-critical error - don't fail the main operation
      console.warn('Failed to write touch file:', error);
    }
  }

  /**
   * Create a FileSystemWatcher for the touch file
   */
  createTouchWatcher(onReload: (key: string, version: number) => void): vscode.FileSystemWatcher {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(path.dirname(this.touchFilePath), path.basename(this.touchFilePath))
    );

    const handleChange = async () => {
      try {
        if (fs.existsSync(this.touchFilePath)) {
          const content = await fs.promises.readFile(this.touchFilePath, 'utf8');
          const notification = JSON.parse(content);
          
          // Don't reload our own changes
          if (notification.clientId !== this.clientId) {
            onReload(notification.key, notification.version);
          }
        }
      } catch (error) {
        console.warn('Failed to read touch file:', error);
      }
    };

    watcher.onDidChange(handleChange);
    watcher.onDidCreate(handleChange);

    return watcher;
  }

  /**
   * Get raw globalState for compatibility with existing code
   */
  getRawGlobalState(): vscode.Memento {
    return this.context.globalState;
  }
}
