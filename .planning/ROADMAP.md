# Roadmap: todo CLI

## Overview

A tiny, dependency-free Node.js CLI built as three vertical slices. Phase 1 delivers a working `todo add` + `todo list` that persists to `./todos.json`. Phase 2 completes the command set with `todo done N` and hardens every failure path (bad input, unknown commands, corrupt storage) so user data is never lost. Phase 3 makes `todo` a global command via `npm link` and locks in behavior with a complete `node:test` suite run by `npm test`.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Add & List with Persistence** - `todo add` and `todo list` work end-to-end and items survive between runs
- [ ] **Phase 2: Mark Done & Safe Failures** - `todo done N` works and every bad input or corrupt file fails clearly without losing data
- [ ] **Phase 3: Global Install & Full Test Suite** - `todo` runs from any directory after `npm link` and `npm test` proves every behavior

## Phase Details

### Phase 1: Add & List with Persistence
**Goal**: User can add items and see them listed, with items persisted in `./todos.json` across separate invocations
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: CMD-01, CMD-02, CMD-04, STOR-01, STOR-02, PKG-02
**Success Criteria** (what must be TRUE):
  1. In a fresh directory with no `todos.json`, running `node todo.js list` prints a friendly "no items" message instead of crashing
  2. User runs `node todo.js add "buy milk"` then `node todo.js add "walk dog"`, and a later separate `node todo.js list` shows `1. [ ] buy milk` and `2. [ ] walk dog` (numbered by position)
  3. A `todos.json` file appears in the current working directory, and running the CLI from a different directory shows that directory's own (separate) list
  4. `package.json` declares `"engines": { "node": ">=22" }` and has no `dependencies`/`devDependencies`; slice-level `node:test` tests for add/list/persistence pass
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — Walking Skeleton: package.json + e2e tests, lib/store.js atomic todos.json storage, todo.js add/list (see 01-SKELETON.md)

### Phase 2: Mark Done & Safe Failures
**Goal**: User can complete items with `todo done N`, and any invalid input or corrupt storage produces a clear error and non-zero exit without damaging data
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CMD-03, ERR-01, ERR-02, ERR-03, STOR-03
**Success Criteria** (what must be TRUE):
  1. After `todo done 1`, `todo list` shows item 1 as `[x]` while other items remain `[ ]`, and the change persists across runs
  2. `todo add` with no text or empty text, and `todo done` with a missing, non-numeric (`abc`), zero, or out-of-range N, each print a clear error message and exit with a non-zero code, leaving `todos.json` unchanged
  3. Running `todo` with no command or an unknown command (e.g. `todo frobnicate`) prints usage and exits non-zero
  4. If `todos.json` contains invalid JSON, every command reports a clear error naming the file, exits non-zero, and the file's bytes are left untouched (even after an `add` attempt)
**Plans**: TBD

### Phase 3: Global Install & Full Test Suite
**Goal**: User can type `todo` from any directory after `npm link`, and `npm test` verifies every command and error case
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PKG-01, TEST-01
**Success Criteria** (what must be TRUE):
  1. After `npm link` in the project, user can `cd` into any other directory and run `todo add "x"` / `todo list` / `todo done 1` successfully (works on Windows and POSIX via the `bin` field and shebang)
  2. `npm test` runs a `node:test` suite (no external test deps) that exercises add, list, empty list, done, persistence, missing-file first run, corrupt file, and every ERR case, including exit codes
  3. `npm test` passes cleanly on Node 22+
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Add & List with Persistence | 0/1 | Not started | - |
| 2. Mark Done & Safe Failures | 0/TBD | Not started | - |
| 3. Global Install & Full Test Suite | 0/TBD | Not started | - |
