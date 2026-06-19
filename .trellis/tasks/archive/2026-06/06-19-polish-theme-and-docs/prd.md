# Polish Theme And Docs

## Goal

Finish the Navo V1 product pass from `doc/Navo_SPEC.md` after the core bookmark, navigation, and search features are implemented. This task covers theme polish, responsive/interaction refinement, open source documentation, and final build readiness for Chrome and Edge.

## Requirements

- Keep light, dark, and system theme modes working through persisted local settings.
- Ensure theme changes are reflected through CSS variables and remain readable in both light and dark contexts.
- Improve UI polish for hover, focus, transitions, spacing, truncation, and responsive behavior without adding a UI framework.
- Keep animations limited to CSS transitions, transform, opacity, and lightweight effects.
- Keep permissions limited to `bookmarks` and `storage`.
- Do not persist the full bookmark tree or add network/backend behavior.
- Complete README in Chinese-first bilingual style with features, tech stack, development, local install for Chrome and Edge, Firefox status, privacy, roadmap, and license.
- Keep CHANGELOG, CONTRIBUTING, LICENSE, and `.gitignore` aligned with V1 scope.
- Preserve existing WXT/Svelte/TypeScript architecture and service boundaries.

## Acceptance Criteria

- [x] Light, dark, and system theme modes are clear, persist after refresh, and use CSS variable-driven styling.
- [x] Search, sidebar, breadcrumb, folder cards, bookmark cards, empty, loading, no-result, and error states have polished spacing and non-breaking text behavior.
- [x] Layout remains usable across desktop, medium, and small viewport widths.
- [x] Bookmark and folder titles/URLs truncate or wrap without breaking layout.
- [x] Manifest permissions remain exactly `bookmarks` and `storage`.
- [x] README is complete, Chinese-first bilingual, and matches V1 capabilities and limitations.
- [x] CHANGELOG documents the V1 release scope.
- [x] CONTRIBUTING explains the basic contribution workflow and required checks.
- [x] LICENSE exists and remains MIT.
- [x] `.gitignore` excludes dependencies, WXT output, logs, env files, and build artifacts.
- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm build:chrome` passes.
- [x] `pnpm build:edge` passes.
- [x] Optional Firefox build is documented as reserved/V1.1 unless it passes without extra scope.

## Notes

- This is a V1 completion task, not a feature expansion task. Do not add bookmark mutation, account sync, AI, tabs/history access, or store publishing automation.
