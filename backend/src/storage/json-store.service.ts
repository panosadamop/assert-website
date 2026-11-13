import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from '../config';

const NAME_RE = /^[a-z0-9-]+$/;
const MAX_BACKUPS = 20;

/**
 * Flat-file JSON store. Each "collection" is one file: DATA_DIR/<name>.json.
 * - Reads are synchronous and served from an in-memory cache (returned as deep copies).
 * - Writes are serialised per file, written atomically (temp file + rename),
 *   and the previous version is kept in DATA_DIR/.backups/ (last 20 per file).
 */
@Injectable()
export class JsonStore {
  private readonly logger = new Logger('JsonStore');
  private readonly dir = config.dataDir;
  private readonly backupDir = path.join(config.dataDir, '.backups');
  private readonly cache = new Map<string, unknown>();
  private readonly queues = new Map<string, Promise<unknown>>();

  constructor() {
    fs.mkdirSync(this.dir, { recursive: true });
    fs.mkdirSync(this.backupDir, { recursive: true });
  }

  private file(name: string): string {
    if (!NAME_RE.test(name)) throw new Error(`Invalid store name: ${name}`);
    return path.join(this.dir, `${name}.json`);
  }

  private clone<T>(value: T): T {
    return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
  }

  exists(name: string): boolean {
    return this.cache.has(name) || fs.existsSync(this.file(name));
  }

  list(): string[] {
    return fs
      .readdirSync(this.dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .filter((n) => NAME_RE.test(n))
      .sort();
  }

  read<T>(name: string, fallback: T): T {
    if (!this.cache.has(name)) {
      const file = this.file(name);
      if (!fs.existsSync(file)) return this.clone(fallback);
      try {
        this.cache.set(name, JSON.parse(fs.readFileSync(file, 'utf8')));
      } catch (err) {
        this.logger.error(`Could not parse ${name}.json: ${(err as Error).message}`);
        return this.clone(fallback);
      }
    }
    return this.clone(this.cache.get(name) as T);
  }

  /** Replaces the whole file. Resolves with the saved value. */
  write<T>(name: string, value: T): Promise<T> {
    return this.enqueue(name, async () => this.persist(name, value));
  }

  /** Read-modify-write under the per-file lock. */
  update<T>(name: string, fallback: T, fn: (current: T) => T | Promise<T>): Promise<T> {
    return this.enqueue(name, async () => this.persist(name, await fn(this.read<T>(name, fallback))));
  }

  private enqueue<T>(name: string, task: () => Promise<T>): Promise<T> {
    const prev = this.queues.get(name) ?? Promise.resolve();
    const next = prev.catch(() => undefined).then(task);
    this.queues.set(name, next);
    return next;
  }

  private async persist<T>(name: string, value: T): Promise<T> {
    const file = this.file(name);
    const json = JSON.stringify(value, null, 2);
    if (fs.existsSync(file)) this.backup(name, file);
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tmp, json, 'utf8');
    try {
      await this.rename(tmp, file);
    } catch (err) {
      await fs.promises.rm(tmp, { force: true });
      throw err;
    }
    this.cache.set(name, JSON.parse(json));
    return this.clone(value);
  }

  /** Windows (and OneDrive/antivirus) can briefly lock files – retry a few times. */
  private async rename(from: string, to: string, attempts = 8): Promise<void> {
    for (let i = 0; ; i++) {
      try {
        return await fs.promises.rename(from, to);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (i >= attempts || !['EPERM', 'EBUSY', 'EACCES'].includes(code ?? '')) throw err;
        await new Promise((r) => setTimeout(r, 50 * (i + 1)));
      }
    }
  }

  private backup(name: string, file: string) {
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(file, path.join(this.backupDir, `${name}.${stamp}.json`));
      const old = fs
        .readdirSync(this.backupDir)
        .filter((f) => f.startsWith(`${name}.`) && f.endsWith('.json'))
        .sort();
      for (const f of old.slice(0, Math.max(0, old.length - MAX_BACKUPS))) fs.unlinkSync(path.join(this.backupDir, f));
    } catch (err) {
      this.logger.warn(`Backup of ${name}.json failed: ${(err as Error).message}`);
    }
  }
}
