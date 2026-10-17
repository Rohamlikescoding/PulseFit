/**
 * Storage Abstraction Layer
 * Encapsulates client persistence behind a swappable interface so it can be seamlessly
 * replaced with IndexedDB, Cloud Firestore, PostgreSQL, or a REST API backend.
 * Includes defensive guards against corrupted or malformed JSON in localStorage.
 */

export interface StorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      // Defensive JSON syntax validation: prevent malformed data from crashing the app
      if (raw.startsWith('{') || raw.startsWith('[')) {
        try {
          JSON.parse(raw);
        } catch (parseErr) {
          console.warn(`[StorageAdapter] Corrupted JSON detected for key "${key}", safely purging:`, parseErr);
          try {
            window.localStorage.removeItem(key);
          } catch {
            // Ignore removal errors
          }
          return null;
        }
      }

      return raw;
    } catch (err) {
      console.error(`[StorageAdapter] Failed reading key "${key}":`, err);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.error(`[StorageAdapter] Failed writing key "${key}":`, err);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.error(`[StorageAdapter] Failed removing key "${key}":`, err);
    }
  }
}

// Default exportable adapter instance
export const appStorage: StorageAdapter = new LocalStorageAdapter();
