# todo CLI

## What This Is

A small Node.js command-line tool for managing to-do items. Users run `todo add "buy milk"`, `todo list`, and `todo done 1`; items persist in a `todos.json` file in the current working directory. It is built as a learning project for practicing the GSD workflow end-to-end, so it is intentionally small and well-defined.

## Core Value

`todo add`, `todo list`, and `todo done N` work reliably and items survive between runs — nothing a user adds is ever lost or corrupted.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can add an item with `todo add "<text>"`
- [ ] User can list all items with `todo list`, numbered by position, completed items shown with a checkmark (e.g. `[x]`)
- [ ] User can mark an item done with `todo done N`, where N is the position shown in the current `todo list` output
- [ ] Items persist to `./todos.json` in the current working directory (per-directory lists)
- [ ] `todo` is installable as a global command via the package.json `bin` field (`npm link`)
- [ ] Invalid input (missing text, bad/out-of-range number, unknown command) produces a clear error and non-zero exit code
- [ ] Behavior is covered by an automated `node:test` suite

### Out of Scope

- Remove/delete, undo, clear-completed, edit commands — v1 deliberately limited to add/list/done
- Hiding completed items / `--all` filter — list always shows everything
- Stable per-item IDs — numbers are list positions by design
- Global/home-directory storage or `TODO_FILE` override — storage is `./todos.json` only
- Any npm dependencies (runtime or dev) — Node built-ins only
- Priorities, due dates, tags, colors, sync — beyond the scope of a learning project

## Context

- Greenfield: the repository contains only the GSD tooling (`.opencode/`) — no application code yet.
- Primary purpose is to learn/practice the GSD workflow (plan → execute → verify) on a small, well-understood problem.
- Platform used for development is Windows; the CLI should work cross-platform (path handling, line endings).

## Constraints

- **Dependencies**: Node.js built-in modules only (`fs`, `path`, `process`, `node:test`, `node:assert`) — explicit project requirement
- **Runtime**: Node.js 22+ — current LTS baseline; enables modern built-ins
- **Storage**: `todos.json` in the current working directory — per-directory lists
- **Testing**: `node:test` built-in runner — no test framework dependencies

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `done N` uses list position, not stable ID | Simplest mental model; matches what `todo list` displays | — Pending |
| Storage in `./todos.json` (cwd) | Per-project lists; simple and visible | — Pending |
| Show completed items with checkmark in `list` | Keep list command single-mode in v1 | — Pending |
| Distribute via package.json `bin` + `npm link` | Lets users type `todo` instead of `node todo.js` | — Pending |
| Automated tests with `node:test` | Verification without adding dependencies | — Pending |
| Node 22+ minimum | Current LTS | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-18 after initialization*
