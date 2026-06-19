# Add Bookmark Search

## Goal

Implement Navo V1 global bookmark search over the loaded bookmark tree, including folder/bookmark grouping, path display, debounced input, no-result state, folder result navigation, and bookmark result links.

## Requirements

- Build a flat in-memory search index after the bookmark tree loads.
- Match trimmed, case-insensitive queries against title, URL, domain, and path text.
- Keep empty queries in normal folder browsing mode.
- Debounce search input by about 150ms.
- Group results into folders and bookmarks.
- Show folder results with title and path.
- Show bookmark results with title, domain, and path.
- Clicking a folder result selects that folder and clears search.
- Clicking a bookmark result opens the URL in the current tab.
- Show a no-result state for non-empty queries with no matches.
- Do not add fuzzy search, pinyin search, or network calls.

## Acceptance Criteria

- [x] `src/utils/search.ts` builds and searches a flat index.
- [x] Search matches title, URL, domain, and path text.
- [x] Search input is debounced around 150ms.
- [x] Search results are grouped into folders and bookmarks.
- [x] Folder results select the folder and clear search.
- [x] Bookmark results render as normal links.
- [x] Empty query restores the current folder view.
- [x] No-result state appears for unmatched non-empty queries.
- [x] Search does not call browser bookmark APIs repeatedly.
- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm build:chrome` passes.

## Notes

- This task uses simple substring matching only.

