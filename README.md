# todo CLI — a GSD workflow tutorial

This repo has two goals:

1. **Build a small, reliable to-do CLI** in Node.js that uses no dependencies.
2. **Practice the [GSD](https://github.com/gsd-build/get-shit-done) workflow end to end** on a small, clearly defined problem: discuss → plan → execute → verify → ship.

The app is small on purpose, so the focus stays on the workflow. Every planning artifact (requirements, roadmap, phase plans, verification reports) is committed under [`.planning/`](.planning/), so you can follow how each feature went from idea to merged PR.

## What the CLI does

```sh
todo add "buy milk"    # Added 1. buy milk
todo list              # 1. [ ] buy milk
todo done 1            # marks item 1 as done (Phase 2)
```

Items are stored in a `todos.json` file in the **current working directory**, so each directory has its own list.

**Core value:** `todo add`, `todo list`, and `todo done N` work reliably, and items survive between runs. Nothing a user adds is ever lost or corrupted.

## Constraints

- **Node.js 22+**
- **Zero npm dependencies.** Only Node built-ins (`fs`, `path`, `process`, `node:test`, `node:assert`) are used.
- **Atomic saves.** Data is written to a temp file and then renamed, so a crash can't leave `todos.json` half-written.
- **Tests** use the built-in `node:test` runner.

## Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 1. Add & List with Persistence | `add`, `list`, `./todos.json` storage | ✅ Done |
| 2. Mark Done & Safe Failures | `done N`, clear errors, corrupt-file safety | ⏳ Planned |
| 3. Global Install & Full Test Suite | `npm link` → `todo` command, full `npm test` coverage | ⏳ Planned |

See [`.planning/ROADMAP.md`](.planning/ROADMAP.md) and [`.planning/REQUIREMENTS.md`](.planning/REQUIREMENTS.md) for details.

## Usage (current)

```sh
node todo.js add "buy milk"
node todo.js list
npm test
```

After Phase 3, `npm link` will make the global `todo` command available.

## Out of scope (v1)

These are left out on purpose: delete/undo/edit commands, stable item IDs, filters, home-directory storage, priorities, due dates, tags, and any npm dependencies.
