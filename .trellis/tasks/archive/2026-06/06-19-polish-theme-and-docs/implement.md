# Polish Theme And Docs Implementation Plan

## Checklist

1. Audit current V1 implementation against `doc/Navo_SPEC.md` acceptance items.
2. Read frontend specs before editing source files.
3. Inspect current docs, manifest config, scripts, and ignored files.
4. Polish UI only where gaps remain:
   - theme readability and transitions
   - responsive layout behavior
   - truncation/wrapping
   - hover/focus affordances
   - empty/loading/error/no-result states
5. Complete README in Chinese-first bilingual style.
6. Update CHANGELOG and CONTRIBUTING for V1 readiness.
7. Confirm LICENSE and `.gitignore` are correct.
8. Run quality checks:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build:chrome`
   - `pnpm build:edge`
9. Run optional `pnpm build:firefox` only if it does not expand scope.
10. Update Trellis specs if this task reveals new implementation conventions.
11. Commit and archive the child task.
12. Run final parent acceptance audit before archiving the parent task.

## Review Gates

- Stop and fix if permissions exceed `bookmarks` and `storage`.
- Stop and fix if docs promise V1 behavior that is not implemented.
- Stop and fix if generated output, secrets, `node_modules`, or browser profile data appear in git status.
