# Requirements: todo CLI

**Defined:** 2026-10-18
**Core Value:** `todo add`, `todo list`, and `todo done N` work reliably and items survive between runs — nothing a user adds is ever lost or corrupted.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Commands

- [ ] **CMD-01**: User can add an item with `todo add "<text>"`; it is saved as not done
- [ ] **CMD-02**: User can see all items with `todo list`, numbered by position (1, 2, 3…), done items marked `[x]`, pending `[ ]`
- [ ] **CMD-03**: User can mark an item done with `todo done N`, where N is the position shown in the current `todo list` output
- [ ] **CMD-04**: User sees a friendly message when `todo list` has no items

### Storage

- [ ] **STOR-01**: Items persist in `todos.json` in the current working directory across separate invocations
- [ ] **STOR-02**: First run works when `todos.json` does not exist (treated as empty list)
- [ ] **STOR-03**: A corrupt `todos.json` produces a clear error and is not overwritten

### Errors

- [ ] **ERR-01**: `todo add` with missing/empty text shows an error and exits non-zero
- [ ] **ERR-02**: `todo done` with missing, non-numeric, or out-of-range N shows an error and exits non-zero
- [ ] **ERR-03**: Unknown command or no command prints usage and exits non-zero

### Packaging

- [ ] **PKG-01**: User can run `todo` from any directory after `npm link` (package.json `bin` field)
- [ ] **PKG-02**: Project has zero npm dependencies and declares Node >=22 in `engines`

### Quality

- [ ] **TEST-01**: `npm test` runs a `node:test` suite covering every command and error case above, and passes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Commands

- **CMD-V2-01**: User can delete an item with `todo remove N`
- **CMD-V2-02**: User can mark a done item as pending again with `todo undo N`
- **CMD-V2-03**: User can remove all completed items with `todo clear`
- **CMD-V2-04**: User can see usage with `todo help`

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Stable per-item IDs | Numbers are list positions by design — simplest mental model |
| Hiding completed items / `--all` flag | `list` stays single-mode in v1 |
| Home-directory storage / `TODO_FILE` override | Storage is `./todos.json` only (per-directory lists) |
| npm dependencies (runtime or dev) | Node built-ins only — explicit project constraint |
| Priorities, due dates, tags, colors, sync | Beyond the scope of a learning project |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 0
- Unmapped: 13 ⚠️

---
*Requirements defined: 2026-10-18*
*Last updated: 2026-10-18 after initial definition*
