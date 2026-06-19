# Add New Tab Layout Implementation Plan

## Checklist

- [x] Read current frontend directory spec.
- [x] Replace placeholder `App.svelte` with workspace shell state.
- [x] Replace `style.css` with theme variables and layout styles.
- [x] Keep app accessible with labels for search and theme controls.
- [x] Run lint, typecheck, and Chrome build.
- [x] Update specs if a reusable convention is established.
- [x] Commit the layout task.

## Validation Commands

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
```

## Rollback Points

- Main edits are limited to `src/entrypoints/newtab/App.svelte` and `src/entrypoints/newtab/style.css`.
- If the Svelte syntax or lint rules conflict with planned markup, keep the layout simple and defer component extraction.


