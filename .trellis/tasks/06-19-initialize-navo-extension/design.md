# Initialize Navo Extension Design

## Repository Strategy

Use the current workspace as the implementation root because it already contains the source SPEC and Trellis planning context. Initialize Git in place, then add `git@github.com:xyzxiaoma/Navo.git` as `origin`. Fetch remote `main` and reconcile its existing README intentionally.

## Extension Strategy

Create a WXT project manually in the existing directory rather than running an interactive scaffold in a non-empty workspace. Use:

- WXT for extension build and manifest generation.
- Svelte 5 for UI.
- TypeScript for app and config.
- Native CSS for the initial visible screen.
- pnpm as the package manager.

## Initial File Shape

```text
entrypoints/
  newtab/
    App.svelte
    main.ts
    style.css
public/
  icons/
src/
  app.d.ts
wxt.config.ts
package.json
tsconfig.json
```

WXT 0.20's official Svelte template does not require a separate `svelte.config.js`, so this initialization follows the template's generated TypeScript setup. The initial UI can be a minimal placeholder that establishes the final app surface. Full layout, bookmark reading, search, and theme behavior belong to later child tasks.

## Manifest Contract

The generated manifest must include:

- name: `Navo`
- description: `A clean visual bookmark workspace for your browser new tab.`
- version: `1.0.0`
- permissions: `bookmarks`, `storage`
- `chrome_url_overrides.newtab`: `newtab.html`
- icons: 16, 48, 128

## Validation

The first child task is complete when dependencies install and the Chrome build succeeds.
