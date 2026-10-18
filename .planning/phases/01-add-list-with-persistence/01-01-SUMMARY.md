---
phase: 01-add-list-with-persistence
plan: 01
subsystem: cli-core
tags: [cli, storage, node-test, walking-skeleton]
requires: []
provides:
  - "todo.js CLI entry with add/list dispatch"
  - "lib/store.js storage seam (todosPath, loadTodos, saveTodos) with atomic save"
  - "test/todo.test.js e2e node:test suite pattern (spawnSync in mkdtemp cwd)"
  - "package.json (engines node >=22, zero deps, npm test)"
affects: [02-done-and-errors, 03-npm-link-and-tests]
tech-stack:
  added: []
  patterns:
    - "CommonJS, Node built-ins only"
    - "Atomic write: .todos.json.<pid>.tmp + fs.renameSync"
    - "stdout via process.stdout.write with literal \\n"
    - "E2E tests spawn process.execPath todo.js with isolated temp cwd"
key-files:
  created: [package.json, todo.js, lib/store.js, test/todo.test.js]
  modified: []
key-decisions:
  - "add joins unquoted argv words with single spaces and trims outer whitespace"
  - "Unknown/missing command sets exitCode 1 silently until ERR-03 (Phase 2)"
  - "loadTodos swallows only ENOENT; JSON parse errors propagate for Phase 2 STOR-03"
requirements-completed: [CMD-01, CMD-02, CMD-04, STOR-01, STOR-02, PKG-02]
duration: ~5min
completed: 2026-10-18
---

# Phase 1 Plan 01: Add & List with Persistence Summary

**Zero-dependency Node CLI where `node todo.js add`/`list` persist items to `./todos.json` (`{version:1, items:[...]}`, pretty-printed) via an atomic temp-file + rename save, covered by 8 end-to-end `node:test` tests.**

## Performance
- Started: 2026-10-18T18:49Z
- Duration: ~5 min
- Tasks: 3/3
- Files created: 4

## Accomplishments
- `package.json`: `engines.node >=22`, no deps/devDeps/bin, `npm test` → `node --test test/*.test.js`
- `lib/store.js`: `todosPath()` resolves `process.cwd()` at call time; `loadTodos()` returns fresh empty store on ENOENT; `saveTodos()` writes `.todos.json.<pid>.tmp` then `renameSync`, unlinking tmp on failure
- `todo.js`: `add` prints `Added N. text`; `list` prints `N. [ ]/[x] text` lines or `No items yet. Add one with: todo add "<text>"`; list never writes
- `test/todo.test.js`: 8 e2e tests (empty list, add numbering, cross-process persistence, exact file format, per-directory lists, no temp file left, unquoted word join, `[x]` rendering)

## Task Commits
1. Task 1 (RED): `078df2b` — test(01-01): package manifest + failing e2e tests
2. Task 2: `ae973ec` — feat(01-01): storage module with atomic save
3. Task 3 (GREEN): `4bf9b56` — feat(01-01): wire add/list CLI to storage; e2e suite green

## Verification
- `npm test`: 8 pass, 0 fail (Node v25.2.1 locally; engines >=22)
- Store verify one-liner printed `ok`
- Manual smoke in a temp dir: empty-list message, `Added 1. buy milk`, `Added 2. walk dog`, list shows both, todos.json in D-01 pretty format
- Repo root has no `todos.json` after tests

## Deviations from Plan
None - plan executed exactly as written.

## TDD Gate Compliance
RED `test(01-01)` commit 078df2b precedes GREEN `feat(01-01)` commit 4bf9b56. No refactor needed.

## Known Stubs
None. (Default branch for unknown commands intentionally exits 1 without output; messages are ERR-03 in Phase 2.)

## Next Phase Readiness
Phase 2 can add `done` to the `switch` in `todo.js` and corrupt-file detection inside `loadTodos()` without changing the storage format or test style.

## Self-Check: PASSED
- FOUND: package.json, todo.js, lib/store.js, test/todo.test.js
- FOUND commits: 078df2b, ae973ec, 4bf9b56
