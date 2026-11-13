// Development runner: TypeScript compiler in watch mode + auto-restarting Node process.
// Works the same on Windows, macOS and Linux (no shell-specific syntax).
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');

// One initial build so dist/main.js exists before node --watch starts.
const first = spawn(process.execPath, [tsc, '-p', 'tsconfig.build.json'], { cwd: root, stdio: 'inherit' });
first.on('exit', (code) => {
  if (code !== 0) process.exit(code ?? 1);
  const watch = spawn(process.execPath, [tsc, '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'], { cwd: root, stdio: 'inherit' });
  const app = spawn(process.execPath, ['--watch-path=dist', '--watch-path=.env', 'app.js'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' },
  });
  const stop = () => { watch.kill(); app.kill(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
});
if (!fs.existsSync(path.join(root, '.env')) && fs.existsSync(path.join(root, '.env.example'))) {
  fs.copyFileSync(path.join(root, '.env.example'), path.join(root, '.env'));
  console.log('[dev] Created backend/.env from .env.example');
}
