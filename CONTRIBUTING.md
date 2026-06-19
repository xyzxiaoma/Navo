# Contributing

感谢你关注 Navo。Navo V1 是一个本地优先、隐私友好的浏览器新标签页书签工作台。

Thanks for your interest in Navo. Navo V1 is a local-first, privacy-friendly browser new tab bookmark workspace.

## Local Setup

```bash
pnpm install
pnpm dev:chrome
```

## Workflow

1. Fork the repository.
2. Create a feature branch.
3. Keep changes focused on one user-visible improvement or maintenance task.
4. Run the required checks.
5. Open a pull request with a clear summary and verification notes.

## Required Checks

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
pnpm build:edge
```

Use Firefox scripts only when working on V1.1 Firefox adaptation:

```bash
pnpm build:firefox
```

## Guidelines

- Keep V1 local-first and privacy-friendly.
- Do not request permissions beyond `bookmarks` and `storage` for V1.
- Do not add backend services, account login, cloud sync, AI features, bookmark mutation, or browser history access in V1 changes.
- Do not commit secrets, browser profile data, `node_modules`, `.output`, `.wxt`, `dist`, or environment files.
- Use Conventional Commits for commit messages, for example `feat: add bookmark search` or `docs: update install guide`.
