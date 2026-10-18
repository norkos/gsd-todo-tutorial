# Walking Skeleton — todo CLI

**Phase:** 1
**Generated:** 2026-10-18

## Capability Proven End-to-End

A user runs `node todo.js add "buy milk"` and, in a later separate run, `node todo.js list` shows `1. [ ] buy milk` — read from and written to `./todos.json` in the current directory.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework / runtime | Plain Node.js 22+, CommonJS, built-in modules only (`fs`, `path`, `process`, `os`, `child_process`, `node:test`, `node:assert`) | Explicit project constraint (zero deps); CommonJS keeps `todo.js` shebang-ready for Phase 3 `bin` |
| "UI" (interface) | Command line: `node todo.js <command> [args]`; `todo.js` dispatches on `argv[0]` with a `switch` | Smallest possible interface; Phase 2 adds `done` and the usage/error default branch to the same switch |
| Output convention | Normal output → stdout via `process.stdout.write` with literal `\n` (never `os.EOL`); stderr reserved for errors (Phase 2) | D-08: identical bytes on Windows and POSIX, exact-string testable |
| Data layer ("DB") | `./todos.json` resolved from `process.cwd()` at call time; shape `{ "version": 1, "items": [ { "text": string, "done": boolean } ] }`; pretty-printed 2-space + trailing newline; missing file = empty list | D-01/D-02/D-03, STOR-01/02; position in `items` is the user-facing number (no ids) |
| Persistence safety | Atomic save: write `.todos.json.<pid>.tmp` in the same directory, then `fs.renameSync` over `todos.json`; tmp unlinked on failure | D-04 / core value: nothing a user adds is ever lost or truncated |
| Storage seam | `lib/store.js` exports `todosPath()`, `loadTodos()`, `saveTodos(data)`; `loadTodos` only swallows `ENOENT` | Single place for Phase 2's corrupt-file detection (STOR-03) without touching command code |
| Auth | None | Single-user local CLI |
| Deployment / run | `node todo.js ...` from any directory (absolute path to repo's `todo.js`); `npm test` → `node --test test/*.test.js` | Phase 3 adds `bin` + shebang + `npm link` for a global `todo` command |
| Test style | `node:test` end-to-end tests spawning `process.execPath todo.js ...` via `spawnSync` with `cwd` = `fs.mkdtempSync` temp dir; exact stdout string assertions | Tests the real user path, never touches a real `todos.json`, cross-platform |
| Directory layout | `todo.js` (entry), `lib/store.js` (storage), `test/*.test.js` (tests), `package.json` | Minimal; later modules go in `lib/` |

## Stack Touched in Phase 1

- [ ] Project scaffold — `package.json` (engines `>=22`, `test` script, no deps), `node:test` runner
- [ ] Routing — command dispatch for `add` and `list` in `todo.js`
- [ ] Database — real read (`loadTodos`) AND real atomic write (`saveTodos`) of `./todos.json`
- [ ] UI — `add` / `list` commands wired through to storage with exact stdout messages
- [ ] Deployment — documented local run: `node todo.js add "x"` / `node todo.js list`; `npm test`

## Out of Scope (Deferred to Later Slices)

- `todo done N` (CMD-03) — Phase 2
- Error messages / non-zero exits for empty add text, bad `done` N, unknown or missing command (ERR-01..03) — Phase 2
- Corrupt `todos.json` detection and never-overwrite guarantee with clear error (STOR-03) — Phase 2
- `bin` field, shebang, `npm link` global command (PKG-01) — Phase 3
- Complete `npm test` suite covering every command and error case (TEST-01 closure) — Phase 3
- Permanently out of scope (REQUIREMENTS.md): stable ids, `--all`/hiding done, home-dir storage / `TODO_FILE`, any npm dependency, priorities/dates/tags/colors/sync

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: User can mark items done with `todo done N`, and every bad input or corrupt `todos.json` fails clearly (stderr + non-zero exit) without changing the file
- Phase 3: User can type `todo` from any directory after `npm link`, and `npm test` proves every command and error case
