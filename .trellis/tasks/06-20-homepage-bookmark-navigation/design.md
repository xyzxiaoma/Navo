# Design: Homepage and Bookmark Navigation

## Architecture and Boundaries

- Keep the feature inside the existing new tab app boundary: `src/entrypoints/newtab/App.svelte` owns top-level view state and rendering.
- Extend local storage through `src/services/storage.service.ts` and `src/types/settings.ts` for bookmark click counts.
- Keep browser bookmark API access in `src/services/bookmark.service.ts` / `browser-api.ts`; no new extension permissions are required.
- Keep existing bookmark tree transformation utilities as the source of truth for valid bookmarks. Quick navigation is derived by joining stored counts with the current transformed bookmark tree.

## Top-Level View Model

- Add local-only `activeView: 'home' | 'bookmarks'` in `App.svelte`.
- Initialize `activeView` to `'home'` on every mount and do not persist it.
- Header becomes a top menu with at least Home and Bookmarks controls plus existing theme controls.
- When `activeView === 'home'`, render the homepage layout and hide the bookmark workspace/sidebar entirely.
- When `activeView === 'bookmarks'`, render the existing bookmark workspace with sidebar, content area, and CRUD actions.

## Bookmark Click Counts

- Store counts in the existing `settings` object as a dictionary keyed by bookmark ID, e.g. `bookmarkClickCounts: Record<string, number>`.
- Normalize the field defensively when loading settings: only finite positive numeric counts survive.
- Increment the count before navigating away from Navo.
- Use one shared open handler for bookmarks opened from quick navigation and bookmark cards so both paths record clicks consistently.
- Keep counts for deleted bookmarks in storage, but quick navigation filters them out by deriving display items from the current tree. This avoids a destructive migration path while keeping UI correct.

## Quick Navigation Derivation

- Flatten current bookmark tree to bookmark nodes with URLs.
- Join each bookmark with `bookmarkClickCounts[bookmark.id]`.
- Filter to count > 0.
- Sort by count descending; use title as a stable secondary order if needed.
- Slice to 8.
- Render empty state when the result is empty.

## Search

- Reuse the existing `searchDraft`, suggestion generation, and `navigateToSearchTarget` behavior.
- The homepage search is the primary search form. In bookmark view, keep search accessible in the same top header unless implementation complexity requires a single shared header form.

## Layout and Visual Direction

- Preserve Navo's warm paper/grid aesthetic and teal accent system so this remains cohesive with the current UI.
- Recompose the page into:
  - compact top navigation/header,
  - centered hero/search area around the upper-middle,
  - quick navigation cards below.
- Bookmark workspace remains functionally similar, but is visually subordinate to the top menu selection.

## Compatibility and Migration

- Existing users with old settings load successfully; missing `bookmarkClickCounts` normalizes to `{}`.
- Existing `lastSelectedFolderId` and `sidebarCollapsed` continue to work inside the bookmark view.
- No data migration command is needed.

## Risks and Mitigations

- Navigating immediately after storage write could drop the increment if not awaited. Mitigation: await the persisted settings update before `window.location.assign`.
- `settings` state could become stale when multiple quick clicks happen in one page lifetime. Mitigation: update local `settings` and `bookmarkClickCounts` together before saving.
- Layout changes could break mobile. Mitigation: update responsive CSS and manually verify at desktop and narrow viewport if possible.

## Rollback Shape

- Revert App.svelte layout/state changes and remove `bookmarkClickCounts` from settings normalization.
- Stored extra `bookmarkClickCounts` data is harmless if older code ignores it.
