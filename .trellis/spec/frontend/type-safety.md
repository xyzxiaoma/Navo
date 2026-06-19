# Type Safety

> Type safety patterns in this project.

## Overview

Navo uses TypeScript for extension UI, services, utilities, and WXT config. Shared data contracts live in `src/types/`; runtime data from browser APIs or storage is normalized at service and utility boundaries before UI code consumes it.

## Type Organization

- `src/types/bookmark.ts` owns bookmark-related contracts:
  - `BrowserBookmarkNode`
  - `NavoBookmarkNode`
  - `NavoNodeType`
  - `FolderChildren`
- `src/types/settings.ts` owns persisted UI settings:
  - `ThemeMode`
  - `NavoLocalSettings`
- Component-local display-only types may stay in the component until reused by another module.

## Validation

Browser APIs and extension storage are boundary inputs. Treat storage values as `unknown`, then normalize before returning typed data to the app.

```typescript
function normalizeSettings(value: unknown): NavoLocalSettings {
  if (!isRecord(value)) return { ...defaultSettings };

  return {
    theme: isThemeMode(value.theme) ? value.theme : defaultSettings.theme,
    sidebarCollapsed:
      typeof value.sidebarCollapsed === 'boolean'
        ? value.sidebarCollapsed
        : defaultSettings.sidebarCollapsed,
  };
}
```

Bookmark tree conversion belongs in `src/utils/tree.ts`; components should consume `NavoBookmarkNode`, not raw browser nodes.

## Common Patterns

- Use type guards for settings and payload normalization.
- Keep `raw` on transformed bookmark nodes for future compatibility, but do not read `raw` from UI components.
- Keep browser namespace compatibility inside `src/services/browser-api.ts`.
- Derive folder children with shared helpers such as `getFolderChildren` so folder-before-bookmark ordering is consistent.


## Search Index Contract

Search utilities consume transformed `NavoBookmarkNode` values, not raw browser bookmark nodes. Build the flat index once after bookmark loading, then search the in-memory index.

```typescript
const searchIndex = createSearchIndex(bookmarkTree);
const results = searchBookmarks(searchIndex, query);
```

Search matching must stay in `src/utils/search.ts`; components may render grouped results but should not duplicate title, URL, domain, or path matching rules.

## Forbidden Patterns

- Do not cast storage payloads directly inside Svelte components.
- Do not call `chrome.*` or `browser.*` directly from UI components.
- Do not persist the full bookmark tree in local storage.
- Do not duplicate bookmark folder/bookmark detection in multiple components; use shared tree helpers.`n- Do not call bookmark APIs during search input changes; search the in-memory index.

## Tests Required

After changing shared types, service boundaries, or tree transforms, run:

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
```

