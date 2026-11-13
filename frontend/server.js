/**
 * Production server for the ASSERT website.
 * - `npm start` / `node server.js`
 * - Startup file for cPanel, Plesk and Virtualmin (Phusion Passenger) Node.js apps.
 * Run `npm run build` once before starting.
 */
const path = require('node:path');
const fs = require('node:fs');
const { createServer } = require('node:http');

// Load .env (Next.js also does this, but we need PORT/HOST before Next starts).
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const next = require('next');

const port = parseInt(process.env.PORT || '3100', 10);
const hostname = process.env.HOST || '0.0.0.0';
const app = next({ dev: false, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
    console.log(`> ASSERT website ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
