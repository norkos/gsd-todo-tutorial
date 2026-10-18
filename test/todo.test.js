'use strict';

// End-to-end slice tests for the todo CLI (Phase 1: add / list / persistence).
// Every test spawns the real CLI with an isolated temp directory as cwd, so the
// repository's own todos.json is never touched.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TODO = path.join(__dirname, '..', 'todo.js');
const EMPTY_MSG = 'No items yet. Add one with: todo add "<text>"\n';

function run(cwd, ...args) {
  const r = spawnSync(process.execPath, [TODO, ...args], { cwd, encoding: 'utf8' });
  return { stdout: r.stdout, stderr: r.stderr, status: r.status };
}

function makeTmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
}

// Runs fn with a fresh temp dir, always cleaning it up afterwards.
function withTmp(fn) {
  return () => {
    const dir = makeTmp();
    try {
      fn(dir);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}

test('list in fresh dir prints friendly empty message', withTmp((dir) => {
  const r = run(dir, 'list');
  assert.equal(r.stdout, EMPTY_MSG);
  assert.equal(r.status, 0);
  assert.equal(fs.existsSync(path.join(dir, 'todos.json')), false, 'list must not create todos.json');
}));

test('add prints position', withTmp((dir) => {
  const a = run(dir, 'add', 'buy milk');
  assert.equal(a.stdout, 'Added 1. buy milk\n');
  assert.equal(a.status, 0);
  const b = run(dir, 'add', 'walk dog');
  assert.equal(b.stdout, 'Added 2. walk dog\n');
  assert.equal(b.status, 0);
}));

test('list after adds (separate processes)', withTmp((dir) => {
  run(dir, 'add', 'buy milk');
  run(dir, 'add', 'walk dog');
  const r = run(dir, 'list');
  assert.equal(r.stdout, '1. [ ] buy milk\n2. [ ] walk dog\n');
  assert.equal(r.status, 0);
}));

test('todos.json format', withTmp((dir) => {
  run(dir, 'add', 'buy milk');
  const file = path.join(dir, 'todos.json');
  assert.equal(fs.existsSync(file), true);
  const expected = JSON.stringify({ version: 1, items: [{ text: 'buy milk', done: false }] }, null, 2) + '\n';
  assert.equal(fs.readFileSync(file, 'utf8'), expected);
}));

test('per-directory lists', () => {
  const dirA = makeTmp();
  const dirB = makeTmp();
  try {
    run(dirA, 'add', 'a');
    run(dirB, 'add', 'b');
    assert.equal(run(dirA, 'list').stdout, '1. [ ] a\n');
    assert.equal(run(dirB, 'list').stdout, '1. [ ] b\n');
  } finally {
    fs.rmSync(dirA, { recursive: true, force: true });
    fs.rmSync(dirB, { recursive: true, force: true });
  }
});

test('no temp file left behind', withTmp((dir) => {
  run(dir, 'add', 'buy milk');
  assert.deepEqual(fs.readdirSync(dir), ['todos.json']);
}));

test('unquoted words are joined', withTmp((dir) => {
  const r = run(dir, 'add', 'buy', 'milk');
  assert.equal(r.stdout, 'Added 1. buy milk\n');
  assert.equal(r.status, 0);
}));

test('list renders done items as [x]', withTmp((dir) => {
  const data = { version: 1, items: [{ text: 'a', done: false }, { text: 'b', done: true }] };
  fs.writeFileSync(path.join(dir, 'todos.json'), JSON.stringify(data, null, 2) + '\n');
  const r = run(dir, 'list');
  assert.equal(r.stdout, '1. [ ] a\n2. [x] b\n');
  assert.equal(r.status, 0);
}));
