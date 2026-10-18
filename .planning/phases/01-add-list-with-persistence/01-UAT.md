---
status: complete
phase: 01-add-list-with-persistence
source: [01-01-SUMMARY.md]
started: 2026-10-18T18:55:50Z
updated: 2026-10-18T19:04:23Z
---

## Current Test

[testing complete]

## Tests

### 1. Empty list in a fresh directory
expected: In a new, empty folder, `node <repo>/todo.js list` prints `No items yet. Add one with: todo add "<text>"`, does not crash, and does not create todos.json.
result: pass

### 2. Add items
expected: In the same folder, `node <repo>/todo.js add "buy milk"` prints `Added 1. buy milk`, then `node <repo>/todo.js add "walk dog"` prints `Added 2. walk dog`.
result: pass

### 3. Items persist between runs
expected: Running `node <repo>/todo.js list` again (a new run) prints `1. [ ] buy milk` and `2. [ ] walk dog` on separate lines, with no header.
result: pass

### 4. todos.json saved in the current folder
expected: A `todos.json` file now exists in that folder (and no leftover `.tmp` file). It contains pretty-printed JSON like `{ "version": 1, "items": [ { "text": "buy milk", "done": false }, ... ] }`.
result: pass

### 5. Separate list per folder
expected: In a different empty folder, `node <repo>/todo.js list` shows the empty message — it does not see the items from the first folder.
result: pass

### 6. Unquoted words are joined
expected: `node <repo>/todo.js add call the bank` (no quotes) prints `Added N. call the bank`, and it appears as one item in `list`.
result: pass

### 7. Test suite passes
expected: Running `npm test` in the repo root reports 8 passing tests and 0 failures, and leaves no todos.json in the repo root.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
