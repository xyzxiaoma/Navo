# Implement Navo V1 Design

## Architecture

Navo V1 is a WXT browser extension with a Svelte 5 new tab entry. The app is local-first: it reads browser bookmarks through extension APIs, transforms them into internal view models, renders them in Svelte, and stores only lightweight UI preferences in extension local storage.

High-level layers:

- Extension shell: WXT config, manifest metadata, new tab entry.
- UI layer: Svelte components for layout, folder tree, cards, breadcrumbs, search results, and states.
- Service layer: browser API wrapper, bookmark loading/transformation, settings storage.
- Utility layer: tree traversal, search indexing, URL/domain parsing.
- Styling layer: native CSS variables, responsive layout, light/dark/system themes, transitions.

## Expected Source Layout

The SPEC expects a layout close to:

```text
entrypoints/
  newtab/
    App.svelte
    main.ts
src/
  components/
  services/
  utils/
  types/
  styles/
public/
  icons/
```

Exact WXT entry naming should follow the installed WXT/Svelte template if it differs, but business logic should stay in `src/` and the new tab page should remain the only V1 extension surface.

## Data Model

Browser bookmark nodes are transformed into `NavoBookmarkNode` values:

- `id`
- `type`: `folder` or `bookmark`
- `title`
- optional `url`
- optional `domain`
- optional `parentId`
- optional `children`
- `path`: array of ancestor/current folder titles for display and search
- `raw`: original browser node for future compatibility

Folders are identified by `children` being an array. Bookmarks are identified by `url` being present. Empty or untitled bookmarks should fall back to domain, URL, or `Untitled`.

## Data Flow

1. New tab entry mounts `App.svelte`.
2. App loads settings from `storage.service.ts`.
3. App loads the bookmark tree once through `bookmark.service.ts`.
4. Bookmark service calls `browserApi.bookmarks.getTree()`.
5. Tree utilities transform raw nodes to Navo nodes and build lookup helpers.
6. App selects `lastSelectedFolderId` when valid, otherwise the first effective root folder.
7. Sidebar, breadcrumbs, folder cards, bookmark cards, and search results render from the transformed tree.
8. User navigation updates selected folder and persists it.
9. Search uses an in-memory flat index, not repeated bookmark API calls.
10. Theme changes update DOM theme state and persist settings.

## Browser API Boundary

Only `src/services/browser-api.ts` should handle extension namespace differences. UI components and business services should not directly call `chrome.*` or `browser.*`.

The wrapper should expose:

- `bookmarks.getTree()`
- `storage.local.get()`
- `storage.local.set()`

It should support Chromium environments through WXT's webextension polyfill or a small fallback wrapper if needed.

## UI Contracts

- Header owns logo/product label, search input, and theme control.
- Sidebar tree renders folders only and emits selected folder IDs.
- Main area renders either current folder content or search results.
- Breadcrumb receives the current path nodes and emits folder selection.
- Cards receive already transformed node props and do not perform tree lookups.
- Search results receives grouped matches and emits folder selection or bookmark opening.
- Shared state is kept in the app layer or small stores if Svelte 5 patterns make that clearer.

## Search Contract

Search builds a flat index once after bookmark load:

- `id`
- `type`
- `title`
- optional `url`
- optional `domain`
- `pathText`
- `node`

Queries are trimmed and lowercased. Empty queries return no results and restore folder view. Matching is simple substring matching over title, URL, domain, and path text. Search input should debounce by about 150ms.

## Storage Contract

Persist only:

- `theme`: `light`, `dark`, or `system`
- optional `lastSelectedFolderId`
- optional `sidebarCollapsed`

Defaults:

- `theme: system`
- `sidebarCollapsed: false`

The full bookmark tree must not be persisted.

## Styling And Interaction

- Use native CSS and CSS variables.
- Use desktop-first layout with a fixed sidebar near 260px at large widths.
- Below 768px, allow sidebar collapse and single-column content.
- Avoid heavyweight UI libraries.
- Cards and tree items should have hover feedback.
- Animations should use `transform` and `opacity`.
- Text overflow must truncate gracefully.

## Compatibility

V1 targets Chrome and Microsoft Edge. Firefox scripts and manifest considerations may be present, but full Firefox validation belongs to V1.1 unless it is trivial through WXT.

## Privacy And Security

- No backend.
- No account.
- No upload or sync of bookmark data.
- No host permissions.
- No page script injection.
- No browser history access.
- No bookmark mutations in V1.

## Rollback Considerations

Each child task should leave the project buildable. If a later UI or behavior task fails, rollback should be limited to that child task's files. The bookmark API service and data utilities are the highest-risk shared contracts and should be validated before broad UI integration.
