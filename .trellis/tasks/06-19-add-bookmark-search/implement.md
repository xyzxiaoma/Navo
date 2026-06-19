# Add Bookmark Search Implementation Plan

## Checklist

- [x] Read current task and frontend specs.
- [x] Add `src/utils/search.ts` with index creation and grouped search.
- [x] Add debounced search state to `App.svelte`.
- [x] Render grouped search results instead of folder contents when query is non-empty.
- [x] Wire folder result selection and search clearing.
- [x] Wire bookmark result links.
- [x] Add no-result state.
- [x] Run lint, typecheck, Chrome build, and Edge build.
- [x] Update specs if a reusable search convention is established.
- [x] Commit the bookmark search task.

## Validation Commands

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
pnpm build:edge
```

