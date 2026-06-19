# Add New Tab Layout

## Goal

Replace the initialization placeholder with Navo V1's desktop-first new tab workspace shell: header, search field, theme control, sidebar folder tree shell, main content area, breadcrumb slot, card grid shell, and reusable state views.

## Requirements

- Keep WXT/Svelte/TypeScript project structure from the initialization task.
- Implement a first-screen app experience rather than a landing page.
- Provide a top header with Navo brand, search input, and theme mode control.
- Provide a left sidebar area for the bookmark folder tree.
- Provide a main content area with breadcrumb, section title, and card grid shell.
- Provide loading, empty, and error state UI surfaces ready for bookmark data integration.
- Establish light, dark, and system theme CSS variables.
- Add a responsive desktop-first layout.
- Keep the UI restrained, clean, and folder-workspace oriented.
- Do not implement browser bookmark API loading, real folder navigation, or search logic in this child task.

## Acceptance Criteria

- [x] `App.svelte` renders a complete Navo workspace shell, not the previous placeholder.
- [x] Header includes product identity, search input, and theme segmented control.
- [x] Sidebar shell visually supports future nested folder rows and selected state.
- [x] Main shell includes breadcrumb display, toolbar/metadata area, and grid-ready content.
- [x] Loading, empty, and error states exist in reusable markup/styles.
- [x] CSS variables define light, dark, and system-aware theme colors.
- [x] Layout is usable at desktop, medium, and narrow widths.
- [x] Text truncation and stable spacing prevent obvious overflow.
- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm build:chrome` passes.

## Notes

- This task may use mock/static rows and cards only to prove the layout. Real bookmark data belongs to the next child task.

