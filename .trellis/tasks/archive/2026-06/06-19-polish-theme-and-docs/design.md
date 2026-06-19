# Polish Theme And Docs Design

## Scope

This task finishes V1 readiness across two surfaces:

- New tab UI polish in `src/entrypoints/newtab/App.svelte` and `style.css`.
- Open source project docs and release-readiness files at the repository root.

It must not change the core data model, browser API wrapper, bookmark loading flow, or search matching contract unless final acceptance reveals a bug.

## Theme Contract

Theme mode remains the persisted `ThemeMode` union:

```ts
type ThemeMode = 'system' | 'light' | 'dark';
```

The app stores `settings.theme` through `storage.service.ts`. `App.svelte` applies the selected mode with the root class contract already used by the UI:

- `theme-system`
- `theme-light`
- `theme-dark`

CSS variables are the styling boundary. Components should consume semantic variables such as `--bg`, `--surface`, `--text`, `--muted`, `--border`, and `--accent` instead of hard-coded theme branches.

## UI Polish Contract

- Keep the first screen as the usable new tab workspace, not a marketing page.
- Preserve the restrained workspace feel from the SPEC.
- Keep cards and controls stable with explicit sizing, grid constraints, and truncation.
- Use CSS transitions for hover/focus/theme changes.
- Keep text readable and non-overlapping at small, medium, and desktop widths.

## Documentation Contract

README should be Chinese-first bilingual and include:

- Product summary.
- Feature list.
- Tech stack.
- Development commands.
- Chrome and Edge local installation.
- Firefox status as reserved/V1.1.
- Privacy statement.
- Roadmap.
- License.

CHANGELOG should document the V1 release. CONTRIBUTING should explain fork/branch/check/PR flow and the expected local checks.

## Compatibility

Chrome and Edge production builds are the required V1 targets. Firefox scripts may remain present as reserved support, but README must avoid promising full V1 Firefox support unless `pnpm build:firefox` and manual extension behavior are verified.

## Rollback

If polish changes introduce layout or build regressions, revert only the UI/doc changes from this task and keep the already-verified bookmark, folder, and search implementation intact.
