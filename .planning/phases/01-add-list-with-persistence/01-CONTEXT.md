# Phase 1: Add & List with Persistence - Context

**Gathered:** 2026-10-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver `node todo.js add "<text>"` and `node todo.js list`, with items persisted in `./todos.json` (current working directory) across separate invocations. A missing `todos.json` is treated as an empty list. `package.json` declares `"engines": { "node": ">=22" }` with zero dependencies, and slice-level `node:test` tests cover add / list / empty list / persistence.

Requirements: CMD-01, CMD-02, CMD-04, STOR-01, STOR-02, PKG-02.

NOT in this phase: `todo done N` (Phase 2), error handling for empty text / unknown commands / corrupt JSON (Phase 2), `bin` field + `npm link` (Phase 3), full `npm test` suite closure (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Storage file format
- **D-01:** `todos.json` is a wrapped object, not a bare array: `{ "version": 1, "items": [ ... ] }`. A missing file is equivalent to `{ "version": 1, "items": [] }`.
- **D-02:** Each item has exactly two fields: `{ "text": string, "done": boolean }`. No ids, no timestamps. Position in `items` is the user-facing number (1-based).
- **D-03:** File is written pretty-printed: `JSON.stringify(data, null, 2) + "\n"` (2-space indent, trailing newline).
- **D-04:** Saves are atomic: write to a temp file in the same directory as `todos.json`, then `fs.renameSync` over `todos.json`. A crash mid-write must never leave a truncated `todos.json`. (Must work on Windows — rename-over-existing is supported by Node's `fs.rename` there.)

### CLI messages & output
- **D-05:** `add` success prints the new item with its position: `Added 2. buy milk` (number = its position in the list after adding).
- **D-06:** Empty `list` prints: `No items yet. Add one with: todo add "<text>"`
- **D-07:** Non-empty `list` prints item lines only — `1. [ ] buy milk` / `2. [x] walk dog` — no header, no summary line.
- **D-08:** All normal output goes to stdout with `\n` line endings on every platform (not `os.EOL`). stderr is reserved for errors (Phase 2).

### the agent's Discretion
- Argument handling for `add` (e.g., whether `todo add buy milk` without quotes joins words, whitespace trimming) — planner decides; keep it simple and consistent with Phase 2's ERR-01 empty-text rule.
- Code layout (single `todo.js` vs. entry + lib module) and test style (spawning the CLI as a child process vs. calling functions directly) — planner decides. Tests must be able to run against an isolated temp directory as cwd so they never touch a real `todos.json`.
- Temp file naming for atomic writes and cleanup on failure.
- Handling of an unrecognised `version` value — out of scope for Phase 1 beyond reading `version: 1`; robust validation lands with Phase 2 corrupt-file handling.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope & constraints
- `.planning/PROJECT.md` — Core value, constraints (Node built-ins only, Node 22+, `./todos.json`, `node:test`), key decisions
- `.planning/REQUIREMENTS.md` — CMD-01, CMD-02, CMD-04, STOR-01, STOR-02, PKG-02 definitions; Out of Scope table
- `.planning/ROADMAP.md` §Phase 1 — Goal and 4 success criteria (exact list output format `1. [ ] buy milk`)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield. Repository contains only GSD tooling (`.opencode/`) and `.planning/`.

### Established Patterns
- None yet. This phase establishes them (file layout, storage module, test style).

### Integration Points
- `todo.js` at repo root is the entry point invoked as `node todo.js ...` (Phase 3 will wire it to `bin` with a shebang — keep that in mind, e.g., no assumptions that break under a shebang).
- `package.json` created in this phase; must have `engines.node >=22`, no `dependencies`/`devDependencies`. A `test` script running `node --test` is reasonable to add now.

</code_context>

<specifics>
## Specific Ideas

- Add confirmation echoes the position so the user immediately knows the N to use later with `todo done N`.
- Empty-list message nudges the user toward the next command.
- Development is on Windows; output and file handling must be cross-platform (always `\n` in stdout).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-add-list-with-persistence*
*Context gathered: 2026-10-18*
