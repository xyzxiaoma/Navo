import type { NavoLocalSettings, ThemeMode } from '../types/settings';
import { browserApi } from './browser-api';

const SETTINGS_STORAGE_KEY = 'settings';

export const defaultSettings: NavoLocalSettings = {
  theme: 'system',
  sidebarCollapsed: false,
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

function normalizeSettings(value: unknown): NavoLocalSettings {
  if (!isRecord(value)) return { ...defaultSettings };

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
  };
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
