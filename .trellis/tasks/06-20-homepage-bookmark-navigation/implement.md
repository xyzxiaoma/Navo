# Implementation Plan

## Ordered Checklist

1. Extend settings types and normalization
   - Add `bookmarkClickCounts: Record<string, number>` to `NavoLocalSettings`.
   - Add default `{}` in `defaultSettings`.
   - Normalize stored click counts in `storage.service.ts`.

2. Add top-level view and click-count state in `App.svelte`
   - Add `type ActiveView = 'home' | 'bookmarks'`.
   - Initialize `activeView = 'home'` and do not persist it.
   - Track `bookmarkClickCounts` from loaded settings.
   - Add derived quick navigation bookmarks from current bookmark tree and counts.

3. Route bookmark opens through a shared counted handler
   - Replace direct `openBookmarkUrl(bookmark.url)` calls with `openBookmark(bookmark)`.
   - Increment and persist the bookmark count before navigating.
   - Use the same handler for quick navigation cards.

4. Restructure markup
   - Convert header into a top menu with Home and Bookmarks actions plus theme controls.
   - Render homepage when `activeView === 'home'`.
   - Render existing workspace only when `activeView === 'bookmarks'`.
   - Keep existing loading/error/empty states usable in the appropriate views.

5. Update styling
   - Add homepage, top menu, hero/search, and quick navigation styles.
   - Adjust workspace layout so it fits under the new top menu.
   - Preserve dark/system theme variable behavior and responsive breakpoints.

6. Validate
   - Run `pnpm typecheck`.
   - Run `pnpm build`.
   - Launch or load the extension/new tab UI and manually verify:
     - initial homepage,
     - top menu switching,
     - search navigation/suggestions,
     - bookmark workspace visibility and CRUD basics,
     - click counts affecting top 8 quick navigation after reload.

## Risky Files / Rollback Points

- `src/entrypoints/newtab/App.svelte`: largest markup/state change. Roll back if view switching or bookmark CRUD breaks.
- `src/entrypoints/newtab/style.css`: broad layout changes. Roll back style chunks if visual regressions appear.
- `src/services/storage.service.ts` and `src/types/settings.ts`: settings schema extension. Extra stored data is backward-compatible because older normalization ignores unknown fields.

## Review Gates Before Start

- PRD has no open questions.
- Design covers storage, derivation, view switching, and rollback.
- Implementation plan includes typecheck, build, and manual browser verification.
