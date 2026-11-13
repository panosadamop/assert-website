#!/usr/bin/env node
/**
 * Builds the CMS (backend/) and the website (frontend/).
 * Installs each app's dependencies first when they are missing – hosting platforms
 * (Vercel, Cloudflare, Render, CI…) only install the root package, which has none.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const run = (cmd, cwd) => {
  console.log(`\n▶ ${cmd}  (${path.relative(root, cwd) || '.'})`);
  // --include=dev: build tools must be installed even when NODE_ENV=production.
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
};

for (const app of ['backend', 'frontend']) {
  const dir = path.join(root, app);
  const hasTsc = fs.existsSync(path.join(dir, 'node_modules', 'typescript'));
  if (!hasTsc) {
    const lock = fs.existsSync(path.join(dir, 'package-lock.json'));
    run(`${lock ? 'npm ci' : 'npm install'} --include=dev --no-audit --no-fund`, dir);
  }
}

run('npm run build', path.join(root, 'backend'));
run('npm run build', path.join(root, 'frontend'));
console.log('\n✔ Build complete.');
