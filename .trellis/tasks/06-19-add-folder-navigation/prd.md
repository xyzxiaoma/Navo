# Add Folder Navigation

## Goal

Implement real folder navigation on top of the loaded bookmark tree: recursive sidebar tree, expand/collapse state, selected folder highlighting, breadcrumb navigation, folder cards, and bookmark cards that open URLs.

## Requirements

- Render all bookmark folders in the left sidebar recursively.
- Show only folders in the sidebar, never bookmark nodes.
- Support expand/collapse for folders with child folders.
- Highlight the selected folder in the sidebar.
- Auto-expand root folders and the selected folder path.
- Render the selected folder's direct subfolders before bookmarks in the main area.
- Let folder cards and breadcrumb segments select folders.
- Let bookmark cards open their URL in the current tab via normal link navigation.
- Keep selected folder persistence from the previous task.
- Preserve browser order inside folder and bookmark groups.
- Keep search UI present but do not implement global search in this task.

## Acceptance Criteria

- [x] Sidebar renders nested folders recursively from real bookmark data.
- [x] Sidebar rows support expand/collapse for folders with child folders.
- [x] Selected folder is visibly highlighted.
- [x] Selecting a sidebar folder updates main content, breadcrumb, and persisted selected folder ID.
- [x] Folder cards select their folder.
- [x] Bookmark cards render as links and open in the current tab.
- [x] Breadcrumb segments select the corresponding folder.
- [x] Empty selected folders show the empty state.
- [x] Folder-before-bookmark ordering is preserved in the main area.
- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm build:chrome` passes.

## Notes

- Search result navigation belongs to the search child task.

