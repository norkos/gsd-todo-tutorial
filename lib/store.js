'use strict';

// Storage seam for the todo CLI: reads and atomically writes ./todos.json
// in the current working directory.

const fs = require('node:fs');
const path = require('node:path');

const FILE_NAME = 'todos.json';

// Fresh empty store each call — never share a mutable default (D-01).
function empty() {
  return { version: 1, items: [] };
}

// Resolved at call time so every directory has its own list (STOR-01).
function todosPath() {
  return path.join(process.cwd(), FILE_NAME);
}

// Missing file means an empty list (STOR-02). Any other error (including
// malformed JSON) propagates; corrupt-file reporting is Phase 2 (STOR-03).
function loadTodos() {
  let raw;
  try {
    raw = fs.readFileSync(todosPath(), 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') return empty();
    throw err;
  }
  return JSON.parse(raw);
}

// Atomic save (D-03, D-04): write a temp file in the same directory, then
// rename it over todos.json. todos.json is never written directly.
function saveTodos(data) {
  const target = todosPath();
  const tmp = path.join(path.dirname(target), '.' + FILE_NAME + '.' + process.pid + '.tmp');
  const json = JSON.stringify(data, null, 2) + '\n';
  try {
    fs.writeFileSync(tmp, json, 'utf8');
    fs.renameSync(tmp, target);
  } catch (err) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      // best-effort cleanup; report the original error
    }
    throw err;
  }
}

module.exports = { todosPath, loadTodos, saveTodos };
