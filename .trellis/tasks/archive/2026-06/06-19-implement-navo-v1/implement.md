# Implement Navo V1 Plan

## Phase Strategy

Use this parent task as the program plan. Create and start child tasks for implementation. Do not start this parent unless direct parent-only work becomes necessary.

Recommended child order:

1. `initialize-navo-extension`
2. `add-new-tab-layout`
3. `load-bookmark-tree`
4. `add-folder-navigation`
5. `add-bookmark-search`
6. `polish-theme-and-docs`

## Child 1: Initialize Navo Extension

Deliverables:

- Establish the local repository strategy.
- Initialize or sync with `git@github.com:xyzxiaoma/Navo.git`.
- Scaffold WXT + Svelte 5 + TypeScript with pnpm.
- Configure manifest name, description, version, permissions, icons, and new tab override.
- Add baseline scripts from the SPEC.
- Add `.gitignore`, README shell, LICENSE, CHANGELOG, and CONTRIBUTING.
- Show a minimal Navo new tab page.

Validation:

- `pnpm install`
- `pnpm dev:chrome` starts.
- `pnpm build:chrome` succeeds.

## Child 2: Add New Tab Layout

Deliverables:

- Header with logo, Navo label, search input, and theme control.
- Sidebar shell and main content shell.
- CSS variables for light and dark themes.
- Responsive desktop-first layout.
- Loading, empty, and error state components or sections.

Validation:

- `pnpm typecheck`
- `pnpm build:chrome`
- Manual desktop viewport inspection.

## Child 3: Load Bookmark Tree

Deliverables:

- `browser-api.ts`
- `bookmark.service.ts`
- `storage.service.ts`
- `tree.ts`
- `url.ts`
- TypeScript types for raw and internal bookmark nodes.
- App load flow with loading and failure handling.
- Initial selected folder resolution.

Validation:

- `pnpm typecheck`
- `pnpm build:chrome`
- Manual check in Chrome with real bookmarks.

## Child 4: Add Folder Navigation

Deliverables:

- Recursive sidebar tree.
- Expand/collapse state.
- Selected folder highlight.
- Folder cards and bookmark cards.
- Breadcrumb navigation.
- Last selected folder persistence.

Validation:

- `pnpm typecheck`
- `pnpm build:chrome`
- Manual checks for nested folders, empty folders, untitled bookmarks, invalid URLs, and bookmark opening.

## Child 5: Add Bookmark Search

Deliverables:

- `search.ts`
- Search index generation.
- 150ms debounced search input behavior.
- Grouped folder/bookmark results.
- No-result state.
- Folder result selection clears search and navigates.
- Bookmark result opens URL.

Validation:

- `pnpm typecheck`
- `pnpm build:chrome`
- Manual checks for title, URL, domain, folder name, and path matches.

## Child 6: Polish Theme And Docs

Deliverables:

- Complete light/dark/system behavior and persistence.
- Hover, transition, truncation, spacing, and responsive polish.
- README complete in Chinese-first bilingual style.
- Privacy explanation.
- Chrome and Edge build checks.
- Firefox script present as reserved support.

Validation:

- `pnpm typecheck`
- `pnpm build:chrome`
- `pnpm build:edge`
- Optional: `pnpm build:firefox` if WXT setup supports it without extra scope.

## Cross-Child Gates

- Do not add permissions beyond `bookmarks` and `storage`.
- Do not persist the full bookmark tree.
- Do not add backend, account, sync, AI, bookmark mutation, or heavy UI framework dependencies.
- Keep each stage buildable before moving to the next child.
- Before changing shared config or constants, search for existing occurrences first.

## Known Risk Points

- Repository setup: local workspace is not a Git repo while remote already has a README.
- WXT/Svelte scaffold details may differ from the SPEC's suggested directory names.
- Browser API namespace differences need to stay contained in `browser-api.ts`.
- Extension API calls may require running in an extension context, so not all behavior can be validated in a normal web dev page.

## Open Decision Before Child 1

Decide how to reconcile the current local workspace with the existing GitHub repo:

- Recommended: keep `D:\projects\navo` as the implementation root, initialize Git here, add the GitHub remote, and reconcile the remote README intentionally during the first child task.
- Alternative: clone the GitHub repo into a clean directory and migrate `doc/Navo_SPEC.md` plus Trellis context there.
