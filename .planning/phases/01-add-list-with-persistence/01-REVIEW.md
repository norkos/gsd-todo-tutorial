---
phase: 01-add-list-with-persistence
reviewed: 2026-10-18T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - package.json
  - todo.js
  - lib/store.js
  - test/todo.test.js
findings:
  critical: 0
  warning: 4
  info: 5
  total: 9
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-10-18T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

I reviewed the Phase 1 walking skeleton: the `package.json` manifest, the `todo.js` entry point, the `lib/store.js` storage module and the `test/todo.test.js` end-to-end tests. The code is small, follows the plan's interface contract exactly, and `npm test` passes (8/8) on Windows. No security vulnerabilities and no blockers were found.

The issues found all relate to the project's core value: "nothing a user adds is ever lost or corrupted". The atomic save stops a *process* crash from truncating the file. It does not make the write durable across a power loss, and it does not prevent lost updates from concurrent `add`s. On Windows, the main development platform, a `todos.json` saved with a UTF-8 BOM is a valid file but makes every command crash. This was confirmed by experiment. Following the review instructions, these items are out of scope and not flagged: empty-text rejection, usage/unknown-command messages, reporting of corrupt or wrongly shaped JSON, and the `done` command.

## Warnings

### WR-01: A UTF-8 BOM in todos.json makes every command crash

**File:** `lib/store.js:26-31`
**Issue:** `fs.readFileSync(..., 'utf8')` keeps a leading U+FEFF byte-order mark, and `JSON.parse` rejects it. A user who hand-edits `todos.json` and saves it with a BOM gets an unhandled `SyntaxError` on both `list` and `add`. Older Windows Notepad, PowerShell 5 `Set-Content -Encoding UTF8` and several Windows editors all save that way. Verified: writing `{"version":1,"items":[...]}` with a BOM and running `node todo.js list` crashes at `<anonymous_script>:1`. The file is not corrupt, so this is not the Phase 2 corrupt-file case. A valid list becomes unreadable on the target platform.
**Fix:**
```js
let raw = fs.readFileSync(todosPath(), 'utf8');
if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
return JSON.parse(raw);
```
Add a test that writes a BOM-prefixed file and checks `list` output.

### WR-02: The atomic save is not durable — there is no fsync before the rename

**File:** `lib/store.js:41-42`
**Issue:** `writeFileSync` followed by `renameSync` protects against the process dying mid-write. Without an fsync, though, the OS can make the rename durable before the data blocks. After a power loss or OS crash, `todos.json` can then be empty or zero-filled, and the previous good contents are gone too. This happens on NTFS, and on ext4/xfs in some configurations. D-04 requires that "a crash mid-write must never leave a truncated todos.json", so the guarantee is only partly met.
**Fix:**
```js
const fd = fs.openSync(tmp, 'w');
try {
  fs.writeFileSync(fd, json, 'utf8');
  fs.fsyncSync(fd);
} finally {
  fs.closeSync(fd);
}
fs.renameSync(tmp, target);
```
(On POSIX, optionally also fsync the directory afterwards. Skip that on Windows, where opening a directory fails.)

### WR-03: Lost update when two `add` commands run at the same time

**File:** `todo.js:13-15`, `lib/store.js:36-51`
**Issue:** `add` runs load → push → save with no lock and no check that the file is unchanged. If two `todo add` processes overlap, both read N items and both write N+1. One item is silently lost, and both processes still print `Added N+1. …`, which goes against "nothing a user adds is ever lost". Each process has its own temp file because of the pid, so the writes do not collide; the lost update is the problem. This is unlikely for one interactive user, but it happens with scripts or shell loops that use `&` / `Start-Job`.
**Fix:** Add a simple lock file around the read-modify-write. Create `todos.json.lock` with `fs.openSync(lockPath, 'wx')`, retry briefly or fail with a clear error on `EEXIST`, and remove the lock in `finally`. Alternatively, record the `mtimeMs`/size at load time and re-check it before the rename, failing if it changed. At minimum, document this as a known limitation for Phase 2.

### WR-04: The rename on Windows can fail with a temporary EPERM/EBUSY and abort `add`

**File:** `lib/store.js:42`
**Issue:** On Windows, `fs.renameSync` over an existing file fails with `EPERM`, `EACCES` or `EBUSY` while another process has the target open. Antivirus scanners, the Search indexer, cloud-sync clients (OneDrive) and editors are common causes. `graceful-fs` and npm retry this for exactly that reason. Here one failure throws, the temp file is removed, and the user's `add` is lost with a stack trace, even though a short retry would almost always work. Windows is the stated development platform.
**Fix:** Retry the rename a few times with a short backoff when the error is `EPERM`, `EACCES` or `EBUSY` and `process.platform === 'win32'`. For example, up to ~10 attempts over ~1s, using `Atomics.wait` on a `SharedArrayBuffer` for a synchronous sleep. Re-throw after the last attempt.

## Info

### IN-01: The predictable temp file name is opened without exclusive create

**File:** `lib/store.js:38,41`
**Issue:** The temp path `.todos.json.<pid>.tmp` is predictable, and `writeFileSync` (flag `w`) follows a symlink that already exists at that path. In a directory other users can write to, someone could plant that symlink. The write then goes to the symlink's target, and the rename turns `todos.json` into that symlink. The risk is low because lists normally live in directories the user owns.
**Fix:** Use `fs.openSync(tmp, 'wx')`, and add randomness to the name, e.g. `` `.todos.json.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp` `` (`node:crypto` is a built-in).

### IN-02: The rename replaces symlinks and resets file permissions

**File:** `lib/store.js:42`
**Issue:** If `todos.json` is a symlink (for example, shared from a dotfiles repo), the first `add` replaces the link with a regular file, so the two copies drift apart silently. File permissions on the original are also replaced by the defaults (umask) for the new file.
**Fix:** Resolve the target with `fs.realpathSync` when it exists, and write the temp file next to the resolved path. Optionally copy the original's `mode` with `fs.chmodSync`. Otherwise, document the behaviour.

### IN-03: Newlines in item text break `list` output and numbering

**File:** `todo.js:12,26`
**Issue:** `todo add "$(printf 'a\nb')"`, or a quoted multi-line argument, stores text with an embedded `\n`. `list` then prints a line that looks like a separate, unnumbered item, which misleads the user about which `N` to pass to `done` later. `.trim()` removes only leading and trailing whitespace.
**Fix:** Collapse inner whitespace when adding, e.g. `args.join(' ').replace(/\s+/g, ' ').trim()`, or reject control characters in Phase 2 together with ERR-01.

### IN-04: The `"main"` field points at a script with side effects

**File:** `package.json:6`, `todo.js:45`
**Issue:** `"main": "todo.js"` means `require('todo-cli')` runs `main(process.argv.slice(2))` immediately, using the host process's argv. It may write `todos.json` or set `process.exitCode = 1`. Also, nothing is exported.
**Fix:** Remove `"main"`, since the package is a CLI (`bin` arrives in Phase 3). Or guard the call with `if (require.main === module) main(process.argv.slice(2));` and export `main`.

### IN-05: Tests ignore exit status and stderr on setup calls

**File:** `test/todo.test.js:55-56,63,74-75,85`
**Issue:** The `run(dir, 'add', …)` calls used as setup do not check `status === 0` or that `stderr` is empty. If one fails, a later assertion fails with an unclear message such as an output mismatch, hiding the real cause. No test checks that normal commands leave stderr empty, even though D-08 reserves stderr for errors.
**Fix:** Add a helper `ok(r)` that asserts `r.status === 0` and `r.stderr === ''`, and call it on every setup `run`.

---

_Reviewed: 2026-10-18T00:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
