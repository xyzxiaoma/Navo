# Initialize Navo Extension

## Goal

Initialize the Navo V1 browser extension project in the current workspace using WXT, Svelte 5, TypeScript, pnpm, and Manifest V3, while preserving the existing SPEC and Trellis planning artifacts.

## Requirements

- Treat `D:\projects\navo` as the project root.
- Initialize Git locally and connect the existing GitHub remote `git@github.com:xyzxiaoma/Navo.git`.
- Reconcile the remote README without losing `doc/Navo_SPEC.md` or `.trellis/` context.
- Create a WXT + Svelte + TypeScript project structure suitable for a new tab extension.
- Configure manifest metadata for Navo V1.
- Request only `bookmarks` and `storage` permissions.
- Configure `chrome_url_overrides.newtab`.
- Add pnpm scripts for development, build, zip, typecheck, lint, and format.
- Add baseline project metadata, `.gitignore`, README, LICENSE, CHANGELOG, and CONTRIBUTING.
- Render a minimal Navo new tab page so the extension has a visible first screen.

## Acceptance Criteria

- [x] Local Git repository exists and has the GitHub remote configured.
- [x] Existing SPEC and Trellis files remain present.
- [x] `package.json` declares WXT, Svelte 5, TypeScript, and pnpm-oriented scripts.
- [x] WXT config defines Navo manifest metadata, new tab override, and only `bookmarks` / `storage` permissions.
- [x] A new tab entry renders a minimal Navo page.
- [x] `.gitignore` excludes `node_modules`, WXT output, build output, env files, OS files, and logs.
- [x] README, LICENSE, CHANGELOG, and CONTRIBUTING exist.
- [x] `pnpm install` succeeds.
- [x] `pnpm build:chrome` succeeds.

## Notes

- This child task should leave the project buildable but does not need to implement bookmark browsing yet.
