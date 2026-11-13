import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

function resolveDir(value: string | undefined, fallback: string): string {
  const dir = path.isAbsolute(value || '') ? (value as string) : path.join(ROOT, value || fallback);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const list = (v?: string) =>
  (v || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

export const config = {
  root: ROOT,
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 4000),
  publicUrl: (process.env.PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, ''),
  dataDir: resolveDir(process.env.DATA_DIR, './storage/data'),
  uploadsDir: resolveDir(process.env.UPLOADS_DIR, './storage/uploads'),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
  jwtExpires: process.env.JWT_EXPIRES || '12h',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@assert.gr').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3100').replace(/\/$/, ''),
  revalidateSecret: process.env.REVALIDATE_SECRET || '',
  corsOrigins: list(process.env.CORS_ORIGINS),
  contactWebhook: process.env.CONTACT_WEBHOOK_URL || '',
  seedDir: path.join(ROOT, 'seed'),
  adminDir: path.join(ROOT, 'admin'),
};

export type AppConfig = typeof config;
