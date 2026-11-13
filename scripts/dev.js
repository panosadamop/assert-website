#!/usr/bin/env node
/** Runs the CMS (port 4000) and the website (port 3100) together with live reload. */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';

for (const app of ['backend', 'frontend']) {
  if (!fs.existsSync(path.join(root, app, 'node_modules'))) {
    console.log('Dependencies are missing – running setup first…');
    require('node:child_process').execSync('node scripts/setup.js', { cwd: root, stdio: 'inherit' });
    break;
  }
}

const colors = { cms: '\x1b[36m', web: '\x1b[35m' };
const children = [];

function start(name, cwd, args) {
  const child = spawn(isWin ? 'npm.cmd' : 'npm', args, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, shell: isWin });
  const prefix = `${colors[name]}[${name}]\x1b[0m `;
  const pipe = (stream, out) => {
    let buf = '';
    stream.on('data', (d) => {
      buf += d.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const l of lines) out.write(prefix + l + '\n');
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    console.log(`${prefix}exited with code ${code}`);
    shutdown();
  });
  children.push(child);
}

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  for (const c of children) {
    if (isWin) spawn('taskkill', ['/pid', String(c.pid), '/T', '/F']);
    else c.kill('SIGINT');
  }
  setTimeout(() => process.exit(0), 500);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`
  ASSERT – development mode
  ─────────────────────────────────────────
  Website   http://localhost:3100
  Admin     http://localhost:4000/admin
  Press Ctrl+C to stop.
`);
start('cms', path.join(root, 'backend'), ['run', 'dev']);
setTimeout(() => start('web', path.join(root, 'frontend'), ['run', 'dev']), 2500);
