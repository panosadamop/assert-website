#!/usr/bin/env node
/**
 * One-time project setup (Windows, macOS, Linux):
 *  - checks the Node.js version
 *  - installs dependencies of backend/ and frontend/
 *  - creates backend/.env and frontend/.env with matching random secrets
 */
const { execSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(`\n✖ Node.js 20.9 or newer is required (you have ${process.versions.node}).\n  Download it from https://nodejs.org (LTS).\n`);
  process.exit(1);
}

const run = (cmd, cwd) => {
  console.log(`\n▶ ${cmd}  (${path.relative(root, cwd) || '.'})`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
};

function ensureEnv(dir, values) {
  const file = path.join(dir, '.env');
  if (fs.existsSync(file)) {
    console.log(`• ${path.relative(root, file)} already exists – keeping it.`);
    return;
  }
  let text = fs.readFileSync(path.join(dir, '.env.example'), 'utf8');
  for (const [k, v] of Object.entries(values)) text = text.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${v}`);
  fs.writeFileSync(file, text);
  console.log(`• Created ${path.relative(root, file)}`);
}

const secret = crypto.randomBytes(24).toString('hex');
const backendEnv = path.join(root, 'backend');
const frontendEnv = path.join(root, 'frontend');

// Reuse an existing shared secret so both apps keep matching.
let shared = secret;
for (const f of [path.join(backendEnv, '.env'), path.join(frontendEnv, '.env')]) {
  if (fs.existsSync(f)) {
    const m = fs.readFileSync(f, 'utf8').match(/^REVALIDATE_SECRET=(.+)$/m);
    if (m && !m[1].startsWith('change-me')) shared = m[1].trim();
  }
}

ensureEnv(backendEnv, { JWT_SECRET: crypto.randomBytes(32).toString('hex'), REVALIDATE_SECRET: shared });
ensureEnv(frontendEnv, { REVALIDATE_SECRET: shared });

const install = (dir) => run(fs.existsSync(path.join(dir, 'package-lock.json')) ? 'npm ci --no-audit --no-fund' : 'npm install --no-audit --no-fund', dir);
install(backendEnv);
install(frontendEnv);

console.log(`
✔ Setup complete.

  Start everything:   npm run dev          (or double-click start-windows.bat / start-mac.command)
  Website:            http://localhost:3100
  Admin (CMS):        http://localhost:4000/admin
  First login:        see ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env
`);
