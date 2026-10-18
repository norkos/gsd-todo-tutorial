# Phase 1: Add & List with Persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-18
**Phase:** 01-Add & List with Persistence
**Areas discussed:** Storage file format, CLI messages & output

---

## Storage file format

**Q: Top-level shape of todos.json?**

| Option | Description | Selected |
|--------|-------------|----------|
| Plain array | `[{"text":"buy milk","done":false}]` — simplest | |
| Wrapped object | `{"version":1,"items":[...]}` — room for format evolution | ✓ |
| You decide | Planner picks | |

**Q: Fields per item?**

| Option | Description | Selected |
|--------|-------------|----------|
| text + done only | Minimal; position = array order | ✓ |
| text + done + createdAt | Adds ISO timestamp | |
| You decide | Planner picks | |

**Q: On-disk formatting?**

| Option | Description | Selected |
|--------|-------------|----------|
| Pretty, 2-space + newline | Readable, clean diffs | ✓ |
| Compact single line | Smallest | |

**Q: Write strategy?**

| Option | Description | Selected |
|--------|-------------|----------|
| Atomic write | Temp file in same dir + rename | ✓ |
| Direct overwrite | `writeFileSync` straight to todos.json | |
| You decide | Planner picks | |

**User's choice:** Wrapped `{version, items}` object; items `{text, done}`; pretty-printed; atomic writes.

---

## CLI messages & output

**Q: What does `add` print on success?**

| Option | Description | Selected |
|--------|-------------|----------|
| Echo with number | `Added 2. buy milk` | ✓ |
| Short confirmation | `Added: buy milk` | |
| Silent | Nothing, exit 0 | |

**Q: Empty-list message?**

| Option | Description | Selected |
|--------|-------------|----------|
| Hint at next step | `No items yet. Add one with: todo add "<text>"` | ✓ |
| Plain | `No items.` | |
| You decide | Any friendly one-liner | |

**Q: Extra list output (header/summary)?**

| Option | Description | Selected |
|--------|-------------|----------|
| Items only | Just `1. [ ] text` lines | ✓ |
| Add a summary line | e.g. `2 items, 0 done` | |

**Q: Output stream & line endings?**

| Option | Description | Selected |
|--------|-------------|----------|
| stdout + `\n` | Same on all OSes; stderr reserved for errors | ✓ |
| Use os.EOL | Platform-native endings | |

**User's choice:** Echo with number; hint-style empty message; items only; stdout with `\n`.

---

## the agent's Discretion

- `add` argument handling (joining unquoted words, trimming)
- Code layout and test style
- Temp-file naming / cleanup for atomic writes
- Unknown `version` handling (deferred to Phase 2 corrupt-file work)

## Deferred Ideas

None.
