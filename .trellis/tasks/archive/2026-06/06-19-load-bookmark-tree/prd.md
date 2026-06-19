# Load Bookmark Tree

## Goal

Connect the Navo new tab app to browser bookmark and storage APIs, transform raw bookmark data into internal typed nodes, and render the loaded root/selected folder summary through the existing layout shell.

## Requirements

- Add shared TypeScript contracts for raw browser bookmark nodes, Navo nodes, and local settings.
- Add a browser API boundary so UI code does not directly call `chrome.*` or `browser.*`.
- Add bookmark service functions for loading the browser bookmark tree and transforming it into Navo nodes.
- Add tree utilities for folder/bookmark detection, root folder selection, node lookup, path lookup, and child counts.
- Add URL utility for domain extraction and fallback display.
- Add storage service for `theme`, `lastSelectedFolderId`, and `sidebarCollapsed` settings.
- Update `App.svelte` to load settings and bookmarks on mount.
- Display loading and error states from real async state.
- Select the saved folder when valid, otherwise select the first effective root folder.
- Render the selected folder's immediate child folders and bookmarks in the existing shell.
- Persist selected folder and theme changes locally.
- Do not implement full recursive sidebar expand/collapse or global search in this child task.

## Acceptance Criteria

- [x] `src/services/browser-api.ts` centralizes extension API access.
- [x] `src/services/bookmark.service.ts` loads and transforms browser bookmarks.
- [x] `src/services/storage.service.ts` reads and writes local settings.
- [x] `src/utils/tree.ts` provides reusable tree lookup and count helpers.
- [x] `src/utils/url.ts` extracts domains safely.
- [x] `src/types/bookmark.ts` and `src/types/settings.ts` define shared contracts.
- [x] `App.svelte` uses real async loading state instead of purely static mock data.
- [x] The selected folder falls back safely when saved folder ID is missing or stale.
- [x] The main content renders immediate child folders before bookmarks.
- [x] Empty and error states are reachable from app state.
- [x] Theme changes persist through storage.
- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm build:chrome` passes.

## Notes

- WXT provides the extension environment. Browser API differences should stay inside `browser-api.ts`.
- This task may keep the sidebar simple; full tree recursion belongs to the folder navigation child task.

