import { browser } from 'wxt/browser';
import type { BrowserBookmarkNode } from '../types/bookmark';

interface ChromeRuntimeError {
  message?: string;
}

interface ChromeRuntime {
  lastError?: ChromeRuntimeError;
}

interface ChromeBookmarksApi {
  getTree(callback: (nodes: BrowserBookmarkNode[]) => void): void;
}

interface ChromeStorageArea {
  get(keys: string[], callback: (items: Record<string, unknown>) => void): void;
  set(values: Record<string, unknown>, callback?: () => void): void;
}

interface ChromeApi {
  runtime?: ChromeRuntime;
  bookmarks?: ChromeBookmarksApi;
  storage?: {
    local?: ChromeStorageArea;
  };
}

const chromeApi = (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;

export const browserApi = {
  bookmarks: {
    async getTree(): Promise<BrowserBookmarkNode[]> {
      if (browser.bookmarks?.getTree) {
        return (await browser.bookmarks.getTree()) as unknown as BrowserBookmarkNode[];
      }

      return getChromeBookmarkTree();
    },
  },
  storage: {
    local: {
      async get(keys: string[]): Promise<Record<string, unknown>> {
        if (browser.storage?.local?.get) {
          return (await browser.storage.local.get(keys)) as Record<string, unknown>;
        }

        return getChromeStorage(keys);
      },
      async set(values: Record<string, unknown>): Promise<void> {
        if (browser.storage?.local?.set) {
          await browser.storage.local.set(values);
          return;
        }

        await setChromeStorage(values);
      },
    },
  },
};

function getChromeBookmarkTree(): Promise<BrowserBookmarkNode[]> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.bookmarks?.getTree) {
      reject(new Error('Bookmark API is not available.'));
      return;
    }

    chromeApi.bookmarks.getTree((nodes) => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to load bookmarks.'));
        return;
      }

      resolve(nodes);
    });
  });
}

function getChromeStorage(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.storage?.local?.get) {
      reject(new Error('Storage API is not available.'));
      return;
    }

    chromeApi.storage.local.get(keys, (items) => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to read settings.'));
        return;
      }

      resolve(items);
    });
  });
}

function setChromeStorage(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.storage?.local?.set) {
      reject(new Error('Storage API is not available.'));
      return;
    }

    chromeApi.storage.local.set(values, () => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to save settings.'));
        return;
      }

      resolve();
    });
  });
}
