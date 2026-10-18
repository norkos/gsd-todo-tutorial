'use strict';

// todo CLI entry point: `node todo.js add "<text>"` / `node todo.js list`.
// Normal output goes to stdout with literal '\n' line endings (D-08).

const { loadTodos, saveTodos } = require('./lib/store');

const EMPTY_MSG = 'No items yet. Add one with: todo add "<text>"\n';

function add(args) {
  // Unquoted words are joined with single spaces; outer whitespace trimmed.
  const text = args.join(' ').trim();
  const data = loadTodos();
  data.items.push({ text, done: false });
  saveTodos(data);
  process.stdout.write(`Added ${data.items.length}. ${text}\n`);
}

function list() {
  // Read-only: never saves, so listing a fresh directory creates no file.
  const { items } = loadTodos();
  if (items.length === 0) {
    process.stdout.write(EMPTY_MSG);
    return;
  }
  const lines = items.map((item, i) => `${i + 1}. [${item.done ? 'x' : ' '}] ${item.text}`);
  process.stdout.write(lines.join('\n') + '\n');
}

function main(argv) {
  const command = argv[0];
  switch (command) {
    case 'add':
      add(argv.slice(1));
      break;
    case 'list':
      list();
      break;
    default:
      // Usage / error messages arrive with ERR-03 in Phase 2.
      process.exitCode = 1;
  }
}

main(process.argv.slice(2));
