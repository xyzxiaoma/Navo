# Load Bookmark Tree Implementation Plan

## Checklist

- [x] Read frontend directory, quality, and type-safety specs.
- [x] Add shared bookmark and settings types.
- [x] Add URL helper.
- [x] Add tree transform and lookup helpers.
- [x] Add browser API wrapper.
- [x] Add bookmark and storage services.
- [x] Update `App.svelte` to load settings/bookmarks and render real selected folder contents.
- [x] Update styles only as needed for real state variants.
- [x] Run lint, typecheck, Chrome build, and Edge build.
- [x] Update specs for any new data/service convention.
- [x] Commit the bookmark tree loading task.

## Validation Commands

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
pnpm build:edge
```

## Rollback Points

- Service and utility files are additive and can be reverted independently.
- `App.svelte` is the primary integration point; keep data transforms out of the component so rollback is tractable.

