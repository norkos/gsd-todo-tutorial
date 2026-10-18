---
phase: 01-add-list-with-persistence
verified: 2026-10-18T21:00:00Z
status: passed
score: 12/12 must-haves verified (4 roadmap SCs + 8 plan truths)
overrides_applied: 0
---

# Phase 1: Add & List with Persistence Verification Report

**Phase Goal:** User can add items and see them listed, with items persisted in `./todos.json` across separate invocations
**Mode:** mvp (user story in PLAN validated: `user-story.validate` → `true`)
**Verified:** 2026-10-18T21:00:00Z
**Status:** passed
**Re-verification:** No (initial verification)

## User Flow Coverage (MVP)

User story: *As a command-line user, I want to add to-do items and list them with `node todo.js add/list`, so that my items are saved in `./todos.json` and are still there the next time I run the tool.*

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| List in a fresh dir | Friendly empty message, exit 0, no file created | Live run in a new temp dir: `No items yet. Add one with: todo add "<text>"`, exit=0, `Test-Path todos.json` = False | ✓ |
| Add items | `Added 1. buy milk`, `Added 2. walk dog` | Live run printed exactly these lines | ✓ |
| List in a later, separate process | `1. [ ] buy milk` / `2. [ ] walk dog` | Live run in a separate process printed exactly these lines | ✓ |
| **Outcome:** items saved in `./todos.json` and still there next run | File in cwd, pretty JSON `{version:1, items:[...]}` | The directory listing shows only `todos.json`, with the expected 2-space JSON content and a trailing newline | ✓ |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC1 | Fresh dir: `node todo.js list` prints a friendly "no items" message instead of crashing | ✓ VERIFIED | Live spot-check; `todo.js:21-25`; `lib/store.js:28` treats ENOENT as an empty list |
| SC2 | add "buy milk", add "walk dog", then a separate list shows `1. [ ] buy milk` and `2. [ ] walk dog` | ✓ VERIFIED | Live spot-check plus the test "list after adds (separate processes)" |
| SC3 | `todos.json` appears in the cwd; a different dir shows its own separate list | ✓ VERIFIED | Live: the second temp dir showed the empty message while the first had 2 items; `todosPath()` resolves `process.cwd()` at call time; test "per-directory lists" |
| SC4 | package.json has engines node >=22 and no deps/devDeps; node:test slice tests pass | ✓ VERIFIED | package.json read directly; `npm test` gave 8 pass, 0 fail |
| T1 | Exact empty message, exit 0 (CMD-04, STOR-02, D-06) | ✓ VERIFIED | `EMPTY_MSG` constant in todo.js:8; live run |
| T2 | `Added 1. buy milk` / `Added 2. walk dog` (CMD-01, D-05) | ✓ VERIFIED | todo.js:17; live run |
| T3 | List output `1. [ ] ...\n2. [ ] ...\n` with no header (CMD-02, D-07) | ✓ VERIFIED | todo.js:26-27; `[x]` rendering covered by a test |
| T4 | todos.json format `{version:1, items:[{text, done:false}]}`, 2-space indent, trailing newline | ✓ VERIFIED | `JSON.stringify(data, null, 2) + '\n'` in store.js:39; live file content; "todos.json format" test |
| T5 | Atomic save: temp file plus rename, no leftover temp file | ✓ VERIFIED | store.js:38-50 (`writeFileSync(tmp)` then `renameSync`, unlink on error); live dir listing showed only `todos.json` |
| T6 | Different directory shows its own list (STOR-01) | ✓ VERIFIED | Same evidence as SC3 |
| T7 | stdout uses `\n`, never os.EOL | ✓ VERIFIED | Only `process.stdout.write` with `'\n'` literals; grep found no `os.EOL` and no `console.log` |
| T8 | engines >=22, zero deps, `npm test` passes (PKG-02) | ✓ VERIFIED | Same evidence as SC4; no `bin` (Phase 3) |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | engines >=22, test script, zero deps | ✓ VERIFIED | Contains `"node": ">=22"`; `scripts.test` = `node --test test/*.test.js` |
| `todo.js` | CLI dispatch for add/list (≥20 lines) | ✓ VERIFIED | 45 lines, real implementation, invoked via `main(process.argv.slice(2))` |
| `lib/store.js` | Exports todosPath/loadTodos/saveTodos | ✓ VERIFIED | `module.exports = { todosPath, loadTodos, saveTodos }`; uses only built-in modules |
| `test/todo.test.js` | e2e node:test (≥40 lines) | ✓ VERIFIED | 101 lines, 8 tests, `spawnSync` in `mkdtempSync` dirs |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| todo.js | lib/store.js | `require('./lib/store')` (todo.js:6), with load and save both used | ✓ WIRED |
| lib/store.js | todos.json in cwd | `path.join(process.cwd(), FILE_NAME)` at call time | ✓ WIRED |
| lib/store.js | atomic save | `fs.writeFileSync(tmp)` → `fs.renameSync(tmp, target)` | ✓ WIRED |
| test/todo.test.js | todo.js | `spawnSync(process.execPath, [TODO, ...args], { cwd })` | ✓ WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| todo.js `list` | `items` | `loadTodos()` → `JSON.parse(fs.readFileSync(todos.json))` | Yes (live run listed items written by earlier processes) | ✓ FLOWING |
| todo.js `add` | `data.items` | `loadTodos()` + push → `saveTodos()` | Yes (file content confirmed) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Test suite | `npm test` | 8 pass, 0 fail | ✓ PASS |
| Empty list | `node todo.js list` (fresh temp dir) | Exact empty message, exit 0, no file created | ✓ PASS |
| Add + persist + list | add ×2 then list (separate processes) | `Added 1/2...`, then `1. [ ] buy milk` / `2. [ ] walk dog` | ✓ PASS |
| Per-directory isolation | `list` in a second temp dir | Empty message | ✓ PASS |
| Repo hygiene | `Test-Path todos.json` at repo root | False | ✓ PASS |

### Probe Execution

None declared or applicable (no `scripts/*/tests/probe-*.sh`).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CMD-01 | 01-01 | Add an item; saved as not done | ✓ SATISFIED | todo.js `add`; `done: false` in the file |
| CMD-02 | 01-01 | List numbered by position, `[x]`/`[ ]` | ✓ SATISFIED | todo.js `list`; `[x]` test |
| CMD-04 | 01-01 | Friendly empty message | ✓ SATISFIED | EMPTY_MSG; live run |
| STOR-01 | 01-01 | Persist in cwd todos.json across invocations | ✓ SATISFIED | Live cross-process and per-directory runs |
| STOR-02 | 01-01 | Missing todos.json is treated as empty | ✓ SATISFIED | ENOENT branch; list does not create the file |
| PKG-02 | 01-01 | Zero deps, engines >=22 | ✓ SATISFIED | package.json |

REQUIREMENTS.md maps exactly these 6 IDs to Phase 1. No orphaned requirements.

### Anti-Patterns Found

No TBD/FIXME/XXX/TODO/HACK/placeholder markers in phase files. The silent `exitCode = 1` default branch is intentional, and ERR-03 in Phase 2 covers it.

Advisory items from 01-REVIEW.md (not must-haves; informational only):

| File | Item | Severity | Notes |
|------|------|----------|-------|
| lib/store.js | WR-01: a UTF-8 BOM in todos.json crashes JSON.parse | ⚠️ Warning (advisory) | Relevant to Phase 2 storage hardening |
| lib/store.js | WR-02: no fsync before rename | ⚠️ Warning (advisory) | Atomic against a process crash, not against power loss |
| todo.js/store.js | WR-03: concurrent `add` can lose an update | ⚠️ Warning (advisory) | Unlikely when used interactively |
| lib/store.js | WR-04: no rename retry on Windows EPERM/EBUSY | ⚠️ Warning (advisory) | — |

None of these stop the Phase 1 goal; the developer can schedule them in Phase 2.

### Human Verification Required

None. Every behavior is CLI output or file content, and live runs verified each one programmatically.

### Gaps Summary

None. All 4 roadmap success criteria and all 8 plan truths are met in the codebase. Artifacts are substantive and wired, data flows from the CLI through the store to `./todos.json`, and the test suite passes independently.

---

_Verified: 2026-10-18T21:00:00Z_
_Verifier: the agent (gsd-verifier)_
