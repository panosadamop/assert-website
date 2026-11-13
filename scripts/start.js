#!/usr/bin/env node
/** Production-like local run: builds (if needed) and starts both apps without live reload. */
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
if (!fs.existsSync(path.join(root, 'backend', 'dist', 'main.js'))) execSync('npm run build', { cwd: path.join(root, 'backend'), stdio: 'inherit', shell: true });
if (!fs.existsSync(path.join(root, 'frontend', '.next', 'BUILD_ID'))) execSync('npm run build', { cwd: path.join(root, 'frontend'), stdio: 'inherit', shell: true });

const kids = [
  spawn(process.execPath, ['app.js'], { cwd: path.join(root, 'backend'), stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } }),
];
setTimeout(() => kids.push(spawn(process.execPath, ['server.js'], { cwd: path.join(root, 'frontend'), stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } })), 2000);
const stop = () => { for (const k of kids) k.kill(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
if (isWin) process.on('SIGBREAK', stop);
