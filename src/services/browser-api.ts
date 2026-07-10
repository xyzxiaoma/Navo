import { browser } from 'wxt/browser';
import type { BrowserBookmarkNode } from '../types/bookmark';

interface ChromeRuntimeError {
  message?: string;
}

interface ChromeRuntime {
  lastError?: ChromeRuntimeError;
  getURL(path: string): string;
}

interface RuntimeUrlApi {
  getURL(path: string): string;
}

interface ChromeBookmarksApi {
  getTree(callback: (nodes: BrowserBookmarkNode[]) => void): void;
  create(
    bookmark: BrowserBookmarkCreateDetails,
    callback: (node: BrowserBookmarkNode) => void,
  ): void;
  update(
    id: string,
    changes: BrowserBookmarkUpdateDetails,
    callback: (node: BrowserBookmarkNode) => void,
  ): void;
  remove(id: string, callback: () => void): void;
  removeTree(id: string, callback: () => void): void;
}

interface BrowserBookmarkCreateDetails {
  parentId?: string;
  index?: number;
  title?: string;
  url?: string;
}

interface BrowserBookmarkUpdateDetails {
  title?: string;
  url?: string;
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
  runtime: {
    getUrl(path: string): string {
      const browserRuntime = browser.runtime as RuntimeUrlApi | undefined;

      if (browserRuntime?.getURL) {
        return browserRuntime.getURL(path);
      }

      return chromeApi?.runtime?.getURL(path) ?? path;
    },
  },
  bookmarks: {
    async getTree(): Promise<BrowserBookmarkNode[]> {
      if (browser.bookmarks?.getTree) {
        return (await browser.bookmarks.getTree()) as unknown as BrowserBookmarkNode[];
      }

      return getChromeBookmarkTree();
    },
    async create(
      bookmark: BrowserBookmarkCreateDetails,
    ): Promise<BrowserBookmarkNode> {
      if (browser.bookmarks?.create) {
        return (await browser.bookmarks.create(bookmark)) as unknown as BrowserBookmarkNode;
      }

      return createChromeBookmark(bookmark);
    },
    async update(
      id: string,
      changes: BrowserBookmarkUpdateDetails,
    ): Promise<BrowserBookmarkNode> {
      if (browser.bookmarks?.update) {
        return (await browser.bookmarks.update(id, changes)) as unknown as BrowserBookmarkNode;
      }

      return updateChromeBookmark(id, changes);
    },
    async remove(id: string): Promise<void> {
      if (browser.bookmarks?.remove) {
        await browser.bookmarks.remove(id);
        return;
      }

      await removeChromeBookmark(id);
    },
    async removeTree(id: string): Promise<void> {
      if (browser.bookmarks?.removeTree) {
        await browser.bookmarks.removeTree(id);
        return;
      }

      await removeChromeBookmarkTree(id);
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

function createChromeBookmark(
  bookmark: BrowserBookmarkCreateDetails,
): Promise<BrowserBookmarkNode> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.bookmarks?.create) {
      reject(new Error('Bookmark API is not available.'));
      return;
    }

    chromeApi.bookmarks.create(bookmark, (node) => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to create bookmark.'));
        return;
      }

      resolve(node);
    });
  });
}

function updateChromeBookmark(
  id: string,
  changes: BrowserBookmarkUpdateDetails,
): Promise<BrowserBookmarkNode> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.bookmarks?.update) {
      reject(new Error('Bookmark API is not available.'));
      return;
    }

    chromeApi.bookmarks.update(id, changes, (node) => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to update bookmark.'));
        return;
      }

      resolve(node);
    });
  });
}

function removeChromeBookmark(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.bookmarks?.remove) {
      reject(new Error('Bookmark API is not available.'));
      return;
    }

    chromeApi.bookmarks.remove(id, () => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to delete bookmark.'));
        return;
      }

      resolve();
    });
  });
}

function removeChromeBookmarkTree(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!chromeApi?.bookmarks?.removeTree) {
      reject(new Error('Bookmark API is not available.'));
      return;
    }

    chromeApi.bookmarks.removeTree(id, () => {
      const error = chromeApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message ?? 'Failed to delete folder.'));
        return;
      }

      resolve();
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
