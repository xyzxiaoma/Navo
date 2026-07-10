# Redesign new tab homepage and bookmark navigation

## Goal

Make Navo open to a first-class homepage instead of immediately showing a selected bookmark folder. The homepage should center search and surface the user's most-used bookmarks as quick navigation, while keeping full bookmark management available from a top navigation menu.

## User Value

- Users land on a cleaner, faster starting page for searching and opening frequent sites.
- Bookmark management remains available without making the default experience feel like a folder browser.
- Frequently used bookmarks become easier to access over time through local click tracking.

## Confirmed Facts

- The extension overrides the browser new tab page via `chrome_url_overrides.newtab`.
- Current new tab UI is implemented in `src/entrypoints/newtab/App.svelte` with styles in `src/entrypoints/newtab/style.css`.
- Current startup loads settings and bookmark tree, selects `lastSelectedFolderId` if available, otherwise the first folder, then renders the bookmark workspace.
- Current settings are stored in browser local storage under `settings` and include `theme`, `lastSelectedFolderId`, and `sidebarCollapsed`.
- Current bookmark click behavior navigates to the URL without recording usage counts.
- Current manifest already has `bookmarks`, `storage`, and `favicon` permissions.

## Requirements

- Default view
  - Opening Navo/new tab always shows a custom homepage, not a selected bookmark folder or the last top-level view.
  - The homepage shows a top menu bar, a prominent search bar positioned around the upper-middle of the page, and a quick navigation section below it.
- Top menu
  - The top menu includes a way to show the homepage and a way to show the bookmark workspace.
  - The bookmark tree/sidebar and folder content appear only after the user chooses the bookmark menu item.
  - Existing theme controls remain available from the top-level UI.
- Search
  - Existing search behavior remains available from the homepage search bar.
  - Search suggestions and URL/search navigation should continue to work as they do today unless changed by later requirements.
- Quick navigation
  - Navo records local click counts for bookmarks when users open a bookmark from Navo.
  - The homepage quick navigation displays up to 8 bookmarks with the highest recorded click counts.
  - Quick navigation items open the bookmark URL and increment that bookmark's click count.
  - Deleted or missing bookmarks must not appear in quick navigation after the bookmark tree is refreshed.
  - When there are no recorded bookmark clicks, the quick navigation area shows an empty state rather than arbitrary bookmarks.
- Bookmark workspace
  - Existing bookmark browsing, folder selection, folder/bookmark creation, editing, deletion, favicon display, and theme behavior should remain functional inside the bookmark view.
  - Selecting folders inside the bookmark view can still use the existing `lastSelectedFolderId` behavior for bookmark-view continuity.
- Persistence
  - Click counts are stored locally with browser storage and should survive new tab reloads.
  - The feature should not require new extension permissions beyond existing storage/bookmarks/favicon permissions.

## Acceptance Criteria

- [ ] Opening every new tab initially displays the homepage with top menu, prominent search, and quick navigation section.
- [ ] The bookmark tree/sidebar is not visible on the initial homepage.
- [ ] Clicking the top menu's bookmark item reveals the bookmark workspace and existing folder/bookmark management UI.
- [ ] Clicking the top menu's home item returns to the homepage.
- [ ] Opening a bookmark from either quick navigation or the bookmark workspace increments that bookmark's local click count.
- [ ] The homepage displays at most 8 bookmarks sorted by click count descending.
- [ ] Bookmarks with no recorded clicks are not shown as quick navigation items.
- [ ] If a counted bookmark no longer exists in the current bookmark tree, it is omitted from quick navigation.
- [ ] Existing search submission and suggestions continue to navigate correctly.
- [ ] Existing light/dark/system theme controls continue to work.
- [ ] Type checking and build pass.
- [ ] The UI is manually verified in the browser extension/new tab page.

## Out of Scope

- Syncing click counts across devices.
- Importing browser history or using global browser visit counts.
- Recommending sites that the user has not clicked from Navo.
- Changing bookmark CRUD semantics beyond moving them behind the bookmark menu.

## Decisions

- Every new Navo/new tab load starts on the homepage. The active top-level view is not persisted.

## Open Questions

- None.
