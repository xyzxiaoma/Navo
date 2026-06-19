# Directory Structure

> How frontend code is organized in this project.

## Overview

Navo is a WXT browser extension using Svelte 5. Follow WXT 0.20's current Svelte template layout: source files live under `src/`, and extension entrypoints live under `src/entrypoints/`.

The product SPEC may show root-level `entrypoints/` as an illustrative layout. In this repository, prefer the WXT template convention so generated `.wxt/` typing and build discovery stay aligned with the toolchain.

## Directory Layout

```text
src/
|-- entrypoints/
|   `-- newtab/
|       |-- App.svelte
|       |-- index.html
|       |-- main.ts
|       `-- style.css
`-- app.d.ts

public/
`-- icons/
    |-- icon-16.png
    |-- icon-48.png
    `-- icon-128.png
```

Future feature code should be added under `src/` using the SPEC boundaries:

```text
src/
|-- components/
|-- services/
|-- utils/
|-- types/
`-- styles/
```

## Module Organization

- `src/entrypoints/newtab/` owns only the browser new tab entry and app composition.
- `src/components/` should contain reusable Svelte UI components.
- `src/services/` should contain browser API, bookmark, and storage services.
- `src/utils/` should contain pure helpers such as tree traversal, search indexing, and URL parsing.
- `src/types/` should contain shared TypeScript contracts.
- `public/icons/` contains extension icons referenced by `wxt.config.ts`.

## Naming Conventions

- Svelte components use PascalCase, for example `AppHeader.svelte`.
- TypeScript utility and service files use kebab-case or dot-qualified names from the SPEC, for example `bookmark.service.ts` and `browser-api.ts`.
- Entrypoint folders use WXT entrypoint names, for example `newtab`.

## Contracts

- WXT must discover the new tab entry from `src/entrypoints/newtab/index.html`.
- The new tab entry must mount Svelte from `src/entrypoints/newtab/main.ts`.
- `wxt.config.ts` is the manifest source of truth; do not hand-edit generated manifests under `.output/`.

## Good / Base / Bad Cases

- Good: add bookmark search helpers in `src/utils/search.ts` and import them into app state.
- Base: keep minimal entrypoint-only UI while the project is being initialized.
- Bad: place long-lived app services inside `src/entrypoints/newtab/`, because those services will become harder to test and reuse.

## Tests Required

- Run `pnpm typecheck` after adding or moving Svelte/TypeScript files.
- Run `pnpm build:chrome` after changing WXT entrypoints, `wxt.config.ts`, or files under `public/`.

## Wrong vs Correct

### Wrong

```text
entrypoints/newtab/App.svelte
```

This bypasses the WXT 0.20 Svelte template convention used by this repository.

### Correct

```text
src/entrypoints/newtab/App.svelte
```

This keeps entrypoint discovery, generated types, and future source organization in one consistent tree.

