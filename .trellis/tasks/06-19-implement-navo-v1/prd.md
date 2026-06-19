# Implement Navo V1

## Goal

Implement Navo V1 from `doc/Navo_SPEC.md`: a privacy-friendly browser new tab extension that visualizes the user's native browser bookmarks as a folder-style workspace.

The parent task owns the full V1 requirement set, child-task map, cross-stage acceptance criteria, and final integration review. Direct implementation should happen in child tasks because the SPEC describes several independently verifiable deliverables.

## Source Of Truth

- Primary product and technical specification: `doc/Navo_SPEC.md`
- Target repository from SPEC: `git@github.com:xyzxiaoma/Navo.git`
- Local workspace at task creation: `D:\projects\navo`
- Local evidence: workspace is not currently a Git repository and contains `AGENTS.md` plus `doc/Navo_SPEC.md`.
- Remote evidence: `git@github.com:xyzxiaoma/Navo.git` is reachable and currently contains a `README.md` on `main`.

## User Value

- Users can open a new browser tab and see their existing browser bookmarks in a clean folder explorer style interface.
- Users can browse bookmark folders, open bookmarks, navigate with breadcrumbs, search by title, URL, domain, folder, or path, and preserve lightweight UI preferences locally.
- Users get this without an account, backend, cloud sync, bookmark mutation, or extra browser permissions.

## Requirements

### Product Scope

- Replace the browser new tab page with Navo.
- Read the browser's native bookmark tree.
- Render a left folder tree that only shows folders.
- Render the selected folder's direct subfolders and bookmarks as cards.
- Support breadcrumb navigation for the current folder path.
- Support global search over folder names, bookmark titles, URLs, domains, and path text.
- Group search results into folders and bookmarks.
- Support light, dark, and system theme modes.
- Persist theme, selected folder, and sidebar collapsed preference locally.
- Display loading, empty, no-result, permission, and general error states.
- Preserve browser bookmark order within each type while showing folders before bookmarks.
- Open bookmark cards in the current tab via normal URL navigation.

### Technical Scope

- Use WXT, Svelte 5, TypeScript, Vite, pnpm, native CSS, and CSS variables.
- Use Manifest V3 first.
- Request only `bookmarks` and `storage` permissions.
- Do not request `tabs`, `history`, `cookies`, `webRequest`, `activeTab`, `scripting`, or host permissions.
- Encapsulate extension API access behind a browser API service.
- Keep bookmark transformation, tree lookup, search indexing, URL parsing, and storage logic in service or utility modules rather than Svelte components.
- Do not save a full local copy of the user's bookmark tree.
- Avoid heavyweight UI libraries.
- Keep animation to CSS transitions, Svelte transitions, `transform`, and `opacity`.

### Open Source Scope

- Provide project scripts for development, build, typecheck, lint, format, and zip flows aligned with the SPEC.
- Include README, LICENSE, CHANGELOG, CONTRIBUTING, and `.gitignore`.
- Document local Chrome and Edge installation, Firefox status, privacy behavior, roadmap, and development commands.

### Explicitly Out Of Scope For V1

- AI classification or summaries.
- Bookmark creation, editing, deletion, or drag sorting.
- Cloud sync, account login, mobile-first optimization, history management, tab management, read-later flows, or workspace one-click open.
- Browser store automated publishing.
- Saving or uploading complete bookmark data.

## Proposed Child Task Map

- `initialize-navo-extension`: repository setup, WXT/Svelte/TypeScript scaffold, pnpm scripts, manifest baseline, docs shell.
- `add-new-tab-layout`: header, sidebar shell, main shell, theme variables, responsive desktop-first layout.
- `load-bookmark-tree`: browser API wrapper, bookmark service, tree transformation, storage service, error/loading state plumbing.
- `add-folder-navigation`: sidebar tree recursion, folder selection, folder/bookmark cards, breadcrumb navigation, selected folder persistence.
- `add-bookmark-search`: search index, debounced query, grouped results, no-result behavior, folder result navigation.
- `polish-theme-and-docs`: theme persistence, animations, visual polish, open source docs, build checks for Chrome and Edge with Firefox script reserved.

## Acceptance Criteria

- [ ] Opening a new tab displays the Navo page.
- [ ] Chrome and Edge builds are configured through WXT.
- [ ] Manifest permissions are limited to `bookmarks` and `storage`.
- [ ] The app successfully reads the browser bookmark tree.
- [ ] The left sidebar shows folder nodes only, supports nesting, selection, expand/collapse, hover, and selected state.
- [ ] The main area shows direct subfolders before bookmarks, preserving browser order within each type.
- [ ] Folder cards navigate into folders.
- [ ] Bookmark cards show title, domain or fallback URL, and open the URL in the current tab.
- [ ] Breadcrumbs show the current path and each segment is navigable.
- [ ] Search matches title, URL, domain, folder name, and path text case-insensitively after trimming input.
- [ ] Search results are grouped into folders and bookmarks.
- [ ] Clearing search restores the previous folder view.
- [ ] Loading, empty folder, no-result, permission, and read-failure states are visible and non-crashing.
- [ ] Light, dark, and system theme modes work and persist after refresh.
- [ ] Last selected folder is restored when possible after refresh.
- [ ] Long titles and URLs truncate without breaking layout.
- [ ] UI is clean, restrained, folder-workspace oriented, and does not resemble a traditional link directory or admin dashboard.
- [ ] `pnpm install` works.
- [ ] `pnpm dev:chrome` starts development.
- [ ] `pnpm build:chrome` succeeds.
- [ ] `pnpm build:edge` succeeds.
- [ ] README, LICENSE, CHANGELOG, CONTRIBUTING, and `.gitignore` exist and match the V1 scope.
- [ ] No secrets, browser profile data, `node_modules`, or build output are committed.

## Notes

- This task is complex and should not start implementation until `design.md`, `implement.md`, and the first child task are ready.
- Planning blocker: decide whether to initialize the current non-Git workspace as the implementation repository or clone/sync from the existing GitHub repo into a clean working tree.
