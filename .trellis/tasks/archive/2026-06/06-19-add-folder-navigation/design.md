# Add Folder Navigation Design

## Scope

This task turns the app from a root-folder browser into a real folder explorer. It keeps implementation inside `App.svelte` for now unless extraction becomes necessary.

## State

Add UI-only expansion state:

```typescript
let expandedFolderIds = new Set<string>();
```

When a folder is selected, ensure every folder in its path is expanded. Root folders should be expanded after the bookmark tree loads.

## Tree Rendering

Sidebar rendering should consume transformed `NavoBookmarkNode` values and filter for folders with shared helpers from `tree.ts`.

Each folder row needs:

- stable key: folder ID
- depth indentation
- expand/collapse button behavior when child folders exist
- selection behavior when row is clicked
- selected state class

## Main Content

Main content uses `getFolderChildren(selectedFolder)` and renders folders first, bookmarks second. Folder cards call `selectFolder`. Bookmark cards use normal anchors with `href` so no `tabs` permission is needed.

## Persistence

`selectFolder(folderId)` continues to persist `lastSelectedFolderId`. Expansion state is UI-only in V1 unless later settings scope changes.

## Validation

Use lint, typecheck, Chrome build, and Edge build. Manual extension verification should check nested folders and bookmark links once loaded in Chrome.
