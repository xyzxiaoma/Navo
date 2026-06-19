# Load Bookmark Tree Design

## Scope

This task introduces the data layer and the first real app state flow. It does not implement search, full recursive navigation, or bookmark mutation.

## Source Layout

```text
src/
|-- services/
|   |-- browser-api.ts
|   |-- bookmark.service.ts
|   `-- storage.service.ts
|-- types/
|   |-- bookmark.ts
|   `-- settings.ts
`-- utils/
    |-- tree.ts
    `-- url.ts
```

## Data Flow

1. `App.svelte` mounts.
2. `storage.service.ts` loads settings with defaults.
3. `bookmark.service.ts` calls `browserApi.bookmarks.getTree()`.
4. `transformBookmarkTree` converts raw nodes into typed Navo nodes with paths and domains.
5. App chooses `settings.lastSelectedFolderId` when it resolves to a folder; otherwise it chooses the first effective root folder.
6. Sidebar shows top-level folders and selected folder context.
7. Main content renders the selected folder's direct children with folders first and bookmarks second.
8. User theme and folder changes update local state and call `saveSettings`.

## Browser API Contract

`browser-api.ts` exposes a small promise-based surface:

```typescript
export const browserApi = {
  bookmarks: {
    getTree(): Promise<BrowserBookmarkNode[]>;
  },
  storage: {
    local: {
      get(keys: string[]): Promise<Record<string, unknown>>;
      set(values: Record<string, unknown>): Promise<void>;
    };
  };
};
```

The wrapper may use WXT's `browser` global when available and fall back to callback-based `chrome.*` APIs.

## Transformation Contract

- A folder has `children` as an array.
- A bookmark has a truthy `url`.
- `path` is an array of display titles from ancestors to the node.
- Empty bookmark titles fall back to domain, URL, then `Untitled`.
- The original node is retained as `raw`.

## Settings Contract

Persist only:

- `theme`: `light`, `dark`, or `system`
- `lastSelectedFolderId`
- `sidebarCollapsed`

Never persist the complete bookmark tree.

## Validation

Use lint, typecheck, and Chrome build. Manual runtime verification in a loaded browser extension will be stronger once navigation and search are implemented.
