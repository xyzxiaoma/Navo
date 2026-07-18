import type { NavoLocalSettings, ThemeMode } from '../types/settings';
import { browserApi } from './browser-api';

const SETTINGS_STORAGE_KEY = 'settings';
const fixedBookmarkLimit = 8;

export const defaultSettings: NavoLocalSettings = {
  theme: 'system',
  sidebarCollapsed: false,
  bookmarkClickCounts: {},
  fixedBookmarkIds: [],
  bookmarkLastOpenedAt: {},
};

export async function getSettings(): Promise<NavoLocalSettings> {
  const result = await browserApi.storage.local.get([SETTINGS_STORAGE_KEY]);
  return normalizeSettings(result[SETTINGS_STORAGE_KEY]);
}

export async function saveSettings(settings: NavoLocalSettings): Promise<void> {
  await browserApi.storage.local.set({
    [SETTINGS_STORAGE_KEY]: settings,
  });
}

export function normalizeSettings(value: unknown): NavoLocalSettings {
  if (!isRecord(value)) return cloneDefaultSettings();

  const bookmarkClickCounts = normalizePositiveNumberRecord(
    value.bookmarkClickCounts,
  );
  const hasStoredFixedIds = Object.prototype.hasOwnProperty.call(
    value,
    'fixedBookmarkIds',
  );

  return {
    theme: isThemeMode(value.theme) ? value.theme : defaultSettings.theme,
    lastSelectedFolderId:
      typeof value.lastSelectedFolderId === 'string'
        ? value.lastSelectedFolderId
        : undefined,
    sidebarCollapsed:
      typeof value.sidebarCollapsed === 'boolean'
        ? value.sidebarCollapsed
        : defaultSettings.sidebarCollapsed,
    bookmarkClickCounts,
    fixedBookmarkIds: hasStoredFixedIds
      ? normalizeFixedBookmarkIds(value.fixedBookmarkIds)
      : seedFixedBookmarkIds(bookmarkClickCounts),
    bookmarkLastOpenedAt: normalizePositiveNumberRecord(
      value.bookmarkLastOpenedAt,
    ),
  };
}

function cloneDefaultSettings(): NavoLocalSettings {
  return {
    ...defaultSettings,
    bookmarkClickCounts: {},
    fixedBookmarkIds: [],
    bookmarkLastOpenedAt: {},
  };
}

function normalizeFixedBookmarkIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const ids: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const id = item.trim();
    if (!id || ids.includes(id)) continue;
    ids.push(id);
    if (ids.length === fixedBookmarkLimit) break;
  }

  return ids;
}

function seedFixedBookmarkIds(clickCounts: Record<string, number>): string[] {
  return Object.entries(clickCounts)
    .sort(([firstId, firstCount], [secondId, secondCount]) => {
      const countDifference = secondCount - firstCount;
      return countDifference || (firstId < secondId ? -1 : firstId > secondId ? 1 : 0);
    })
    .slice(0, fixedBookmarkLimit)
    .map(([bookmarkId]) => bookmarkId);
}

function normalizePositiveNumberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};

  const values: Record<string, number> = {};

  for (const [rawId, numberValue] of Object.entries(value)) {
    const id = rawId.trim();
    if (
      id &&
      typeof numberValue === 'number' &&
      Number.isFinite(numberValue) &&
      numberValue > 0
    ) {
      values[id] = numberValue;
    }
  }

  return values;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
