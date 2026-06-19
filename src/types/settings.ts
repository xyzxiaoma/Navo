export type ThemeMode = 'light' | 'dark' | 'system';

export interface NavoLocalSettings {
  theme: ThemeMode;
  lastSelectedFolderId?: string;
  sidebarCollapsed: boolean;
}
