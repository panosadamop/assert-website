#!/usr/bin/env node
/**
 * Builds both apps and copies everything a server needs into ./release:
 *   release/assert-cms   → upload as the CMS Node.js app   (startup file: app.js)
 *   release/assert-web   → upload as the website Node.js app (startup file: server.js)
 * node_modules are NOT included – run "npm install" (or "Run NPM Install" in cPanel) on the server.
 * Useful for shared hosting where running `next build` on the server hits memory limits.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'release');
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit', shell: true });

sh('npm run build', path.join(root, 'backend'));
sh('npm run build', path.join(root, 'frontend'));

fs.rmSync(out, { recursive: true, force: true });
const copy = (from, to, filter) => fs.cpSync(from, to, { recursive: true, filter });
const skip = (p) => !/[\\/](node_modules|storage|\.env)$/.test(p) && !p.includes(`${path.sep}.next${path.sep}cache`);

const cms = path.join(out, 'assert-cms');
for (const f of ['app.js', 'package.json', 'package-lock.json', '.env.example', 'dist', 'admin', 'seed']) {
  copy(path.join(root, 'backend', f), path.join(cms, f), skip);
}
const web = path.join(out, 'assert-web');
for (const f of ['server.js', 'app.js', 'package.json', 'package-lock.json', 'next.config.ts', 'tsconfig.json', '.env.example', '.next', 'public', 'src']) {
  copy(path.join(root, 'frontend', f), path.join(web, f), skip);
}
console.log(`\n✔ Release ready in ${out}\n  Upload "assert-cms" and "assert-web" to your server – see docs/DEPLOYMENT.md.`);
