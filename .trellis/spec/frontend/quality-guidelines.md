# Quality Guidelines

> Code quality standards for frontend development.

## Overview

Navo uses ESLint flat config, TypeScript, Svelte 5, and WXT. Linting must cover both plain TypeScript files and TypeScript inside `.svelte` components.

## Required Patterns

### ESLint Must Parse TypeScript In Svelte Files

When `.svelte` files contain `<script lang="ts">`, configure the Svelte ESLint parser to delegate script parsing to the TypeScript parser:

```typescript
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...svelte.configs.recommended,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
);
```

Without this block, `pnpm lint` can fail on valid Svelte TypeScript with parse errors such as `Unexpected token ThemeMode`, even when `pnpm typecheck` passes.


### Svelte State Should Avoid Mutable Built-ins

Do not store native mutable `Set` or `Map` instances in Svelte component state. The lint rule `svelte/prefer-svelte-reactivity` flags this because mutations can bypass reactivity.

Use immutable arrays for simple ID collections:

```typescript
let expandedFolderIds: string[] = [];

expandedFolderIds = expandedFolderIds.includes(folderId)
  ? expandedFolderIds.filter((expandedId) => expandedId !== folderId)
  : [...expandedFolderIds, folderId];
```

If a real set/map API is needed, use Svelte's reactive collection helpers instead of native mutable collections.

### Theme And UI Preference Contract

The new tab shell applies theme mode through `data-theme` on `.app-shell`; CSS variables own the actual light, dark, and system colors. Future theme polish should extend semantic variables rather than branching component markup by theme.

```svelte
<div class="app-shell" data-theme={theme}>
  ...
</div>
```

Persisted UI preferences such as theme, selected folder, and sidebar collapsed state must be saved by merging the current `NavoLocalSettings` object and calling `storage.service.ts`. Do not write raw storage payloads in Svelte components.

Icon-only or symbol-only controls, such as the sidebar collapse toggle, need an accessible name (`aria-label`) and visible focus styling.

## Forbidden Patterns

- Do not rely on `svelte-check` alone for Svelte files; run `pnpm lint` as well so accessibility and style rules are enforced.
- Do not hand-edit generated WXT output under `.output/`; update source files or `wxt.config.ts` instead.

## Testing Requirements

Run these checks after frontend source, WXT config, or shared lint config changes:

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
```

Use `pnpm build:edge` when the change touches manifest, WXT config, extension assets, or release-readiness behavior.

## Code Review Checklist

- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build:chrome` passes.
- [ ] Svelte components with lists use keyed `{#each}` blocks.
- [ ] Long visible text has truncation or wrapping rules.
- [ ] Extension permissions remain limited to the task scope.

